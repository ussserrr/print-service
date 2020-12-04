import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { TemplateFile } from './entities/template-file.entity';

import { CreateTemplateFileInput } from './dto/create-template-file.input';
import { UpdateTemplateFileInput } from './dto/update-template-file.input';
import * as gqlSchema from 'src/graphql';  // TODO maybe should transform input and do not expose that we use graphql (use some transformation Nest decorators in resolver)


const operatorsMap = {
  [gqlSchema.Operator.LT]: '<',
  [gqlSchema.Operator.LE]: '<=',
  [gqlSchema.Operator.GT]: '>',
  [gqlSchema.Operator.GE]: '>='
};


@Injectable()
export class TemplateFilesService {
  constructor(
    @InjectRepository(TemplateFile)
    private repository: Repository<TemplateFile>
  ) {}

  create(createTemplateFileInput: CreateTemplateFileInput) {
    return 'This action adds a new templateFile';
  }

  findAll(filter: gqlSchema.TemplateFilesFilter, options: gqlSchema.TemplateFilesRequestOptions): Promise<[TemplateFile[], number]> {
    let q = this.repository.createQueryBuilder('file');

    q = q.leftJoinAndSelect('file.templateType', 'templateType')
         .leftJoinAndSelect('file.currentFileOfType', 'currentFileOfType');

    if (filter.common?.search)
      q = q.where(new Brackets(qb => ['title', 'name'].reduce((qb, field) => {
        const uniqVarName = field + 'Search';
        return qb.orWhere(`file.${field} ~* :${uniqVarName}`, { [uniqVarName]: filter.common?.search });
      }, qb)));
      // TODO: const searchFields = [...]; q = searchFields.reduce(..., q);
      // q = q.where(new Brackets(qb => qb
      //   .where('file.title ~* :search', filter.common)  // TODO: min length
      //   .orWhere('file.name ~* :search', filter.common)));
    if (Array.isArray(filter.common?.ids) && filter.common.ids.length) {
      q = q.andWhereInIds(filter.common?.ids);
    } else {
      //
    }

    if (Array.isArray(filter.templateTypes) && filter.templateTypes.length) {  // TODO: check for non-empty
      q = q.andWhere('file.templateType IN (:...templateTypes)', { templateTypes: filter.templateTypes });
    } else {
      //
    }
    for (const field of ['createdAt', 'updatedAt']) {
      if (Array.isArray(filter[field]) && filter[field].length) {
        for (let idx = 0; idx < filter[field].length; idx++) {
          const halfInterval = filter[field][idx];
          const uniqVarName = field + halfInterval.operator + idx;
          q = q.andWhere(`file.${field} ${operatorsMap[halfInterval.operator]} :${uniqVarName}`,
                         { [uniqVarName]: halfInterval.value });
        }
      } else {
        //
      }
    }

    if (options.page.sortBy) {
      q = q.orderBy(`type.${options.page.sortBy.field}`, options.page.sortBy.order);
    }
    q = q.skip(options.page.offset)  // TODO: default value
         .take(options.page.limit);

    console.log(q.getSql());
    return q.getManyAndCount();
  }

  findOne(id: string, relations?: string[]): Promise<TemplateFile> {
    return this.repository.findOne(id, { relations });
  }

  update(id: string, updateTemplateFileInput: UpdateTemplateFileInput) {
    return `This action updates a #${id} templateFile`;
  }

  remove(id: string) {
    return `This action removes a #${id} templateFile`;
  }
}
