import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { TemplateType } from './entities/template-type.entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { CreateTemplateTypeInput } from './dto/create-template-type.input';
import { UpdateTemplateTypeInput } from './dto/update-template-type.input';


@Injectable()
export class TemplateTypesService {
  columns: string[] = [];

  constructor(
    @InjectRepository(TemplateType)
    private repository: Repository<TemplateType>
  ) {
    this.columns = this.repository.metadata.ownColumns.map(column => column.propertyName);
  }

  create(createTemplateTypeInput: CreateTemplateTypeInput) {
    return 'This action adds a new templateType';
  }

  findAll(filter: FilterDto, options: RequestOptionsDto): Promise<[TemplateType[], number]> {
    let q = this.repository.createQueryBuilder('type');

    q = q.leftJoinAndSelect('type.currentFile', 'currentFile');
    // if (options.listFiles)
    //   q = q.leftJoinAndSelect('type.files', 'file');

    if (filter.common?.search)
      q = q.where('type.title ~* :search', { search: filter.common?.search });
    if (typeof filter.active === 'boolean')
      q = q.andWhere('type.active = :active', { active: filter.active });
    if (Array.isArray(filter.common?.ids) && filter.common.ids.length)
      q = q.andWhereInIds(filter.common?.ids);

    if (Array.isArray(filter.owners) && filter.owners.length)
      q = q.andWhere('type.owner IN (:...owners)', { owners: filter.owners.map(o => o.toLowerCase()) });  // TODO: implementation details

    if (options.page.sortBy && Object.keys(options.page.sortBy).length) {
      if (this.columns.some(f => options.page.sortBy.field.startsWith(f))) {  // field can actually be "nested", e.g. file.templateType.id
        q = q.orderBy(`type.${options.page.sortBy.field}`, options.page.sortBy.order);
      } else {
        throw new Error(`sortBy: no such field '${options.page.sortBy.field}'`);
      }
    }
    q = q.skip(options.page.offset)
         .take(options.page.limit);

    // console.log(q.getSql());
    return q.getManyAndCount();
  }

  findOne(id: string, options: FindOneOptions<TemplateType> = { relations: ['currentFile'] }): Promise<TemplateType> {
    return this.repository.findOne(id, options);
  }

  update(id: string, updateTemplateTypeInput: UpdateTemplateTypeInput) {
    return `This action updates a #${id} templateType`;
  }

  remove(id: string) {
    return `This action removes a #${id} templateType`;
  }
}
