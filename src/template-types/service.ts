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
    this.entityColumns = this.repository.metadata.ownColumns.map(column => column.propertyName);
  }


  async create(input: CreateDto): Promise<TemplateType> {
    const containingPath = path.join(this.config.storageRootPath, input.owner);
    const name = await getUniqueNameFromTitle(containingPath, input.title, 'dir');
    // In case 'owner' folder doesn't exist yet we use 'recursive=true'
    fs.mkdirSync(path.join(containingPath, name), { recursive: true });

    // Don't need to retrieve the findOne as this fresh entity doesn't have any linked entities yet anyway
    return this.repository.save({ ...input, name });
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
  async update(id: string, input: UpdateDto): Promise<[TemplateType, string[]]> {
    const warnings: string[] = [];

    const type = await this.repository.findOneOrFail(id, { relations: ['currentFile'] });

    if (Object.values(input).some(v => v !== undefined)) {
      const updateData: Partial<TemplateType & UpdateDto> = Object.assign({ id }, input);

      if (input.title) {
        const containingPath = path.join(this.config.storageRootPath, type.owner);
        const newName = await getUniqueNameFromTitle(containingPath, input.title, 'dir');
        if (newName !== type.name) {  // title may change but transliterated name don't
          fs.renameSync(
            path.join(containingPath, type.name),
            path.join(containingPath, newName)
          );
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
    } else {
      console.warn(`No properties to change were been provided`);
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
    rimraf.sync(path.join(this.config.storageRootPath, removed.owner, removed.name));

    await this.repository.remove(removed);

    return removedCopy;
  }

}
