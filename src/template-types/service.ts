import * as path from 'path';
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';

import * as rimraf from 'rimraf';
import * as _ from 'lodash';

import { getUniqueNameFromTitle } from 'src/util/util';

import appConfig from 'src/config/app.config';

import { TemplateFile } from 'src/template-files/entities/entity';

import { TemplateType } from './entities/entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';



@Injectable()
export class TemplateTypesService {

  private entityColumns: string[] = [];

  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    @InjectRepository(TemplateType) private repository: Repository<TemplateType>,
    @InjectRepository(TemplateFile) private filesRepository: Repository<TemplateFile>
  ) {
    this.entityColumns = repository.metadata.ownColumns.map(column => column.propertyName);
  }


  async create(input: CreateDto): Promise<TemplateType> {
    const duplicatesCondition = input;
    const duplicates = await this.repository.find({ where: duplicatesCondition });
    if (duplicates.length) {
      throw new Error(`TemplateType with ${JSON.stringify(duplicatesCondition)} already exist`);
    }

    const containingPath = path.join(this.config.storagePath, input.owner);
    const name = await getUniqueNameFromTitle('create', containingPath, input.title, 'dir');

    // For entity triggers to run on save the entity itself should be created, not just the object
    const type = this.repository.create({ ...input, name });
    const created = await this.repository.save(type);

    // In case 'owner' folder doesn't exist yet we use 'recursive=true'
    fs.mkdirSync(path.join(containingPath, name), { recursive: true });

    return created;
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
      q = q.andWhere('type.owner IN (:...owners)', { owners: filter.owners });

    if (options.page?.sortBy && Object.keys(options.page?.sortBy).length) {
      if (this.entityColumns.some(f => options.page?.sortBy?.field.startsWith(f))) {
        // Field can actually be "nested"
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


  // Note:
  // Technically, such methods are not atomic - there are not only a DB updates but file-system changes.
  // So in case of some error occuring there is a possibility for actions to be partially applied
  // See https://typeorm.io/#/transactions for possible solution (at least a part of it)
  async update(id: string, input: UpdateDto): Promise<[TemplateType, string[]]> {
    const warnings: string[] = [];

    const type = await this.repository.findOneOrFail(id, { relations: ['currentFile'] });

    if (Object.values(input).some(v => v !== undefined)) {
      if (
        (input.active === true || input.active === false) &&
        (input.active !== type.active) &&
        (!type.currentFile && !input.currentFileId)
      ) {
        delete input.active;
        warnings.push('Field "active" cannot be changed on template types with no current file');
      }

      // For entity triggers to run on save the entity itself should be created, not just the object
      const updateData: Partial<TemplateType & UpdateDto> = this.repository.create({
        ..._.cloneDeep(type),
        ...input
      })

      const containingPath = path.join(this.config.storagePath, type.owner);
      const currentName = type.name;
      let newName = '';
      if (input.title) {
        const duplicatesCondition = {
          owner: type.owner,
          title: input.title
        };
        const duplicates = await this.repository.find({ where: duplicatesCondition });
        if (duplicates.length && !duplicates.every(t => t.id === type.id)) {
          throw new Error(`TemplateType with ${JSON.stringify(duplicatesCondition)} already exist`);
        }

        newName = await getUniqueNameFromTitle('update', containingPath, input.title, 'dir');
        if (currentName !== newName) {  // title may change but transliterated name don't
          updateData.name = newName;
        }
      }

      if (input.currentFileId && input.currentFileId !== type.currentFile?.id) {
        const fileToMakeCurrent = await this.filesRepository.findOneOrFail(input.currentFileId, { relations: ['templateType'] });
        if (fileToMakeCurrent.templateType.id === id) {
          updateData.currentFile = fileToMakeCurrent;
        } else {
          warnings.push(`currentFileId="${input.currentFileId}" doesn't belong to the "${type.title}" files`);
        }
      } else if (input.currentFileId === null && type.currentFile) {
        updateData.currentFile = null as any;
      }

      await this.repository.save(updateData);

      if (input.title && currentName !== newName) {
        fs.renameSync(
          path.join(containingPath, currentName),
          path.join(containingPath, newName)
        );
      }
    } else {
      warnings.push(`No properties to update were been provided`);
    }

    return [await this.findOne(id), warnings];
  }


  async remove(id: string): Promise<TemplateType> {
    const removed = await this.repository.findOneOrFail(id, { relations: ['currentFile', 'files'] });

    const removedCopy = _.cloneDeep(removed);

    if (removed.currentFile) {
      // Need to break the relation first
      await this.repository.save({ id, currentFile: null as any });
    }
    await this.filesRepository.remove(removed.files);
    rimraf.sync(path.join(this.config.storagePath, removed.owner, removed.name));

    await this.repository.remove(removed);

    return removedCopy;
  }

}
