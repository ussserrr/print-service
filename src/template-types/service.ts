import * as path from 'path';
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';

const rimraf = require('rimraf');  // works only like that
import { ruToEn } from 'src/util/transliterate/ru-to-en';

import appConfig from 'src/config/app.config';

import { TemplateFile } from 'src/template-files/entities/entity';

import { TemplateType } from './entities/entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';



@Injectable()
export class TemplateTypesService {

  entityColumns: string[] = [];

  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    @InjectRepository(TemplateType) private repository: Repository<TemplateType>,
    @InjectRepository(TemplateFile) private filesRepository: Repository<TemplateFile>
  ) {
    this.entityColumns = this.repository.metadata.ownColumns.map(column => column.propertyName);
  }


  async create(data: CreateDto): Promise<TemplateType> {
    let name = ruToEn(data.title)  // transliterate
      .replace(/[- ]/g, '_')  // ' ', '-'     =>     '_'
      .replace(/[^\w]/g, '')  // leave only alphanumerical and _
      .toLowerCase();

    let typePath = path.join(this.config.storageRootPath, data.owner, name);
    const typePathExists = await new Promise<boolean>(resolve => fs.access(typePath, err => resolve(err ? false : true)));
    if (typePathExists) {
      // Generate new name and retry
      name = name + '_' + new Date().valueOf();  // use current date as randomization factor
      typePath = path.join(this.config.storageRootPath, data.owner, name);
      fs.mkdirSync(typePath);
    } else {
      fs.mkdirSync(typePath, { recursive: true });
    }

    // Don't need to retrieve the findOne as this fresh entity doesn't have any linked entities anyway
    return this.repository.save({ ...data, name });

    // TODO: revert changes if error occurred
  }


  findAll(filter: FilterDto, options: RequestOptionsDto): Promise<[TemplateType[], number]> {
    let q = this.repository.createQueryBuilder('type');

    q = q.leftJoinAndSelect('type.currentFile', 'currentFile');
    // Don't join files here as we don't know how many of them and so on

    if (filter.common?.search)
      q = q.where('type.title ~* :search', { search: filter.common?.search });
    if (typeof filter.active === 'boolean')
      q = q.andWhere('type.active = :active', { active: filter.active });
    if (Array.isArray(filter.common?.ids) && filter.common?.ids.length)
      q = q.andWhereInIds(filter.common?.ids);

    if (Array.isArray(filter.owners) && filter.owners.length)
      q = q.andWhere('type.owner IN (:...owners)', { owners: filter.owners.map(o => o.toLowerCase()) });  // TODO: implementation details

    if (options.page?.sortBy && Object.keys(options.page?.sortBy).length) {
      if (this.entityColumns.some(f => options.page?.sortBy?.field.startsWith(f))) {  // field can actually be "nested", e.g. file.templateType.id
        q = q.orderBy(`type.${options.page.sortBy.field}`, options.page.sortBy.order);
      } else {
        throw new Error(`sortBy: no such field '${options.page.sortBy.field}'`);
      }
    }
    q = q.skip(options.page?.offset)
         .take(options.page?.limit);

    return q.getManyAndCount();
  }


  async findOne(
    id: string,
    options: FindOneOptions<TemplateType> = {
      relations: ['currentFile']
    }
  ): Promise<TemplateType>
  {
    return this.repository.findOneOrFail(id, options);
  }


  async update(id: string, data: UpdateDto): Promise<TemplateType> {
    await this.repository.findOneOrFail(id);

    if (Object.values(data).some(v => v ?? false)) {
      // TODO: probably we can (and should) rename a folder when title is changing
      await this.repository.save({ ...data, id });
    } else {
      console.warn(`No properties to change were been provided`);
    }

    return this.findOne(id);
  }


  async remove(id: string): Promise<TemplateType> {
    const removed = await this.findOne(id, { relations: ['currentFile', 'files'] });

    await this.filesRepository.remove(removed.files);
    rimraf.sync(path.join(this.config.storageRootPath, removed.owner, removed.name));

    await this.repository.remove(removed);
    // Primary key is removed from the entity by the TypeORM at this point so we restore it manually.
    // Probably a bad design decision (in ORM), actually. See https://github.com/typeorm/typeorm/issues/1421
    removed.id = id;
    return removed;
  }
}
