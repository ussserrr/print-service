/**
 * TODO:
 *   - decide where and should we set default input values
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TemplateType } from './entities/template-type.entity';

import { CreateTemplateTypeInput } from './dto/create-template-type.input';
import { UpdateTemplateTypeInput } from './dto/update-template-type.input';
import * as gqlSchema from 'src/graphql';  // TODO maybe should transform input and do not expose that we use graphql (use some transformation Nest decorators in resolver)


@Injectable()
export class TemplateTypesService {
  constructor(
    @InjectRepository(TemplateType)
    private repository: Repository<TemplateType>
  ) {}

  create(createTemplateTypeInput: CreateTemplateTypeInput) {
    return 'This action adds a new templateType';
  }

  findAll(filter: gqlSchema.TemplateTypesFilter, options: gqlSchema.TemplateTypesRequestOptions): Promise<[TemplateType[], number]> {
    let q = this.repository.createQueryBuilder('type');

    q = q.leftJoinAndSelect('type.currentFile', 'currentFile');
    if (options.listPageOfFiles)
      q = q.leftJoinAndSelect('type.files', 'file');

    if (filter.common?.search)
      q = q.where('type.title ~* :search', { search: filter.common?.search });  // TODO: min length
    if (typeof filter.active === 'boolean')
      q = q.andWhere('type.active = :active', { active: filter.active });
    if (Array.isArray(filter.common?.ids) && filter.common.ids.length) {
      q = q.andWhereInIds(filter.common?.ids);
    } else {
      //
    }
    if (Array.isArray(filter.owners) && filter.owners.length) {
      q = q.andWhere('type.owner IN (:...owners)', { owners: filter.owners.map(o => o.toLowerCase()) });  // TODO: implementation details
    } else {
      //
    }

    if (options.page.sortBy) {
      q = q.orderBy(`type.${options.page.sortBy.field}`, options.page.sortBy.order);
    }
    q = q.skip(options.page.offset)  // TODO: default value
         .take(options.page.limit);

    // console.log(q.getSql());
    return q.getManyAndCount();
  }

  findOne(id: string, relations?: string[]): Promise<TemplateType> {
    return this.repository.findOne(id, { relations });
  }

  update(id: string, updateTemplateTypeInput: UpdateTemplateTypeInput) {
    return `This action updates a #${id} templateType`;
  }

  remove(id: string) {
    return `This action removes a #${id} templateType`;
  }
}
