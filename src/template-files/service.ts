import * as path from 'path';
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOneOptions, Repository } from 'typeorm';
import { FileUpload } from 'graphql-upload';
import { ConfigType } from '@nestjs/config';

import appConfig from 'src/config/app.config';

import { getUniqueNameFromTitle } from 'src/util/util';

import { Operators } from 'src/common/graphql/types/dto';

import { TemplateTypesService } from 'src/template-types/service';
import { PrintService } from 'src/print/service';

import { TemplateFile } from './entities/entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';



@Injectable()
export class TemplateFilesService {

  private entityColumns: string[] = [];

  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    @InjectRepository(TemplateFile) private repository: Repository<TemplateFile>,
    private readonly templateTypesService: TemplateTypesService,
    private readonly printService: PrintService
  ) {
    this.entityColumns = repository.metadata.ownColumns.map(column => column.propertyName);
  }


  async create(file: FileUpload, input: CreateDto): Promise<[TemplateFile, string[]]> {
    const warnings: string[] = [];

    const fileType = this.config.allowedFileTypes.find(t => t.mime === file.mimetype);
    if (fileType === undefined) {
      throw new Error('Template file should be one of: ' + this.config.allowedFileTypes.map(t => t.extension).join(', '));
    }

    const type = await this.templateTypesService.findOne(input.templateTypeId, { relations: ['files'] });

    const title = input.title || file.filename;
    const containingPath = path.join(this.config.storagePath, type.owner, type.name);
    const name = await getUniqueNameFromTitle('create', containingPath, title, 'file', path.extname(file.filename));
    const filePath = path.join(containingPath, name);
    await new Promise((resolve, reject) =>
      file.createReadStream()
        .pipe(fs.createWriteStream(filePath))
        .on('finish', resolve)
        .on('error', reject)
    );
    if (fs.statSync(filePath).size <= 0) {  // additional check for file correctness
      throw new Error('Input file is empty');
    }

    const created = await this.repository.save({
      name,
      title,
      templateType: type,
      mimeType: file.mimetype
    });

    if (type.files.length >= this.config.filesToKeep) {
      const oldestFile = type.files.reduce((oldest, file) =>
        file.updatedAt.valueOf() >= oldest.updatedAt.valueOf() ? oldest : file
      );
      const [removed, removalWarnings] = await this.remove(oldestFile.id);
      warnings.push(...removalWarnings);
      warnings.push(`The oldest file has been removed: ${removed.title}`);
    }

    if (input.isCurrentFileOfItsType) {
      await this.templateTypesService.update(type.id, { currentFileId: created.id });
      created.currentFileOfType = type;
    }

    created.templateType.files.push(created);

    return [created, warnings];
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
      if (this.entityColumns.some(f => options.page?.sortBy?.field.startsWith(f))) {
        // Field can actually be "nested", e.g. file.templateType.id
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


  async update(id: string, input: UpdateDto): Promise<[TemplateFile, string[]]> {
    const warnings: string[] = [];

    const file = await this.repository.findOneOrFail(id, { relations: ['templateType'] });

    if (Object.values(input).some(v => v !== undefined)) {
      const updateData: Partial<TemplateFile & UpdateDto> = Object.assign({ id }, input);

      if (input.title && input.title !== file.title) {
        const containingPath = path.join(this.config.storagePath, file.templateType.owner, file.templateType.name);
        const newName = await getUniqueNameFromTitle('update', containingPath, input.title, 'file', path.extname(file.name));
        if (newName !== file.name) {  // title may change but transliterated name don't
          fs.renameSync(
            path.join(containingPath, file.name),
            path.join(containingPath, newName)
          );
          updateData.name = newName;
        }
      }

      if (input.isCurrentFileOfItsType === true) {
        await this.templateTypesService.update(file.templateType.id, { currentFileId: id });
      } else if (input.isCurrentFileOfItsType === false) {
        await this.templateTypesService.update(file.templateType.id, { currentFileId: null as any });
      }

      await this.repository.save(updateData);
    } else {
      warnings.push(`No properties to update were been provided`);
    }

    return [await this.findOne(id), warnings];
  }


  convertMimeTypeToExtension(mimeType: string) {
    const mimeAsExtension = this.config.allowedFileTypes.find(type => type.mime === mimeType)?.extension;
    return mimeAsExtension ?? mimeType;
  }


  async remove(id: string): Promise<[TemplateFile, string[]]> {
    const warnings: string[] = [];

    const removed = await this.repository.findOneOrFail(id, { relations: ['templateType', 'currentFileOfType'] });

    if (removed.currentFileOfType) {
      // Break the relation first otherwise the deletion will fail
      await this.templateTypesService.update(removed.currentFileOfType.id, { currentFileId: null as any });
      warnings.push(`Deleted file was a current one for the "${removed.currentFileOfType.title}" type`);
    }

    const filePath = path.join(this.config.storagePath, removed.templateType.owner, removed.templateType.name, removed.name);
    fs.unlinkSync(filePath);

    await this.repository.remove(removed);
    // Primary key is removed from the entity by the TypeORM at this point so we restore it manually.
    // Probably a bad design decision (in ORM), actually. See https://github.com/typeorm/typeorm/issues/1421
    removed.id = id;
    return [removed, warnings];
  }


  async print(id: string, userId: number, fillData?: Record<string, any>) {
    const file = await this.repository.findOneOrFail(id, { relations: ['templateType'] });
    const filePath = path.join(this.config.storagePath, file.templateType.owner, file.templateType.name, file.name);
    return this.printService.print(filePath, userId, fillData);
  }

  async download(id: string): Promise<[string, string]> {
    const file = await this.repository.findOneOrFail(id, { relations: ['templateType'] });
    const filePath = path.join(this.config.storagePath, file.templateType.owner, file.templateType.name, file.name);
    return [filePath, file.title || file.name];
  }

}
