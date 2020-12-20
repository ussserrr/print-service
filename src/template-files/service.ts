import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOneOptions, Repository } from 'typeorm';
import { FileUpload } from 'graphql-upload';
import { ConfigType } from '@nestjs/config';

import appConfig from 'src/config/app.config';

import { Operators } from 'src/common/graphql/types/dto';

import { TemplateTypesService } from 'src/template-types/service';

import { TemplateFile } from './entities/entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';



@Injectable()
export class TemplateFilesService {

  entityColumns: string[] = [];

  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    @InjectRepository(TemplateFile) private repository: Repository<TemplateFile>,
    private readonly templateTypesService: TemplateTypesService
  ) {
    this.entityColumns = this.repository.metadata.ownColumns.map(column => column.propertyName);
  }


  async create(file: FileUpload, data: CreateDto): Promise<TemplateFile> {
    const type = await this.templateTypesService.findOne(data.templateTypeId, { relations: [] });

    const filePath = path.join(this.config.storageRootPath, type.owner, type.name);
    // TODO: use ID as name or (better) transliterate as it for TemplateType
    const fileName = uuidv4() + path.extname(file.filename);
    await new Promise((resolve, reject) =>
      file.createReadStream()
        .pipe(fs.createWriteStream(path.join(filePath, fileName)))
        .on('finish', resolve)
        .on('error', reject)
    );

    // TODO: if (data.makeCurrentFileOfItsType)

    const created = await this.repository.save({
      templateType: type,
      name: fileName,
      mimeType: file.mimetype,
      title: data.title || file.filename
    });  // TODO: maybe retrieve and return findOne (with convenient relations and all)
    created.templateType = type;
    // if (data.makeCurrentFileOfItsType) {
    //   created.currentFileOfType = type;
    // }
    return created;
  }


  findAll(filter: FilterDto, options: RequestOptionsDto): Promise<[TemplateFile[], number]> {
    let q = this.repository.createQueryBuilder('file');

    q = q.leftJoinAndSelect('file.templateType', 'templateType')
         .leftJoinAndSelect('file.currentFileOfType', 'currentFileOfType');

    if (filter.common?.search)
      q = q.where(new Brackets(qb => ['title', 'name'].reduce((qb, field) => {
        const uniqVarName = field + 'Search';
        return qb.orWhere(`file.${field} ~* :${uniqVarName}`, { [uniqVarName]: filter.common?.search });
      }, qb)));
    if (Array.isArray(filter.common?.ids) && filter.common?.ids.length)
      q = q.andWhereInIds(filter.common?.ids);

    if (Array.isArray(filter.templateTypes) && filter.templateTypes.length)
      q = q.andWhere('file.templateType IN (:...templateTypes)', { templateTypes: filter.templateTypes });
    for (const field of ['createdAt', 'updatedAt']) {
      if (Array.isArray(filter[field]) && filter[field].length) {
        for (let idx = 0; idx < filter[field].length; idx++) {
          const halfInterval = filter[field][idx];
          const uniqVarName = field + halfInterval.operator + idx;
          q = q.andWhere(`file.${field} ${Operators[halfInterval.operator]} :${uniqVarName}`,
                         { [uniqVarName]: halfInterval.value.toISOString() });
        }
      }
    }

    if (options.page?.sortBy) {
      if (this.entityColumns.some(f => options.page?.sortBy?.field.startsWith(f))) {  // field can actually be "nested", e.g. file.templateType.id
        q = q.orderBy(`file.${options.page.sortBy.field}`, options.page.sortBy.order);
      } else {
        throw new Error(`sortBy: no such field '${options.page.sortBy.field}'`);
      }
    }
    q = q.skip(options.page?.offset)
         .take(options.page?.limit);

    return q.getManyAndCount();
  }


  findOne(
    id: string,
    options: FindOneOptions<TemplateFile> = {
      relations: ['templateType', 'currentFileOfType']
    }
  ): Promise<TemplateFile>
  {
    return this.repository.findOneOrFail(id, options);
  }


  async update(id: string, data: UpdateDto): Promise<TemplateFile> {
    await this.repository.findOneOrFail(id);

    if (Object.values(data).some(v => v ?? false)) {
      if (data.title) {
        await this.repository.save({
          id: id,
          title: data.title
        });
      }

      if (data.makeCurrentFileOfItsType) {
        // TODO
      }
    } else {
      console.warn(`No properties to change were been provided`);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<TemplateFile> {
    // TODO: what if this is a current file of some type?

    const removed = await this.findOne(id);

    const filePath = path.join(this.config.storageRootPath, removed.templateType.owner, removed.templateType.name, removed.name);
    fs.unlinkSync(filePath);

    await this.repository.remove(removed);
    // Primary key is removed from the entity by the TypeORM at this point so we restore it manually.
    // Probably a bad design decision (in ORM), actually. See https://github.com/typeorm/typeorm/issues/1421
    removed.id = id;
    return removed;
  }
}
