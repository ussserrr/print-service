import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOneOptions, Repository } from 'typeorm';

import { Operators } from 'src/common/types/dto';

import { TemplateFile } from './entities/template-file.entity';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { CreateTemplateFileInput } from './dto/create-template-file.input';
import { UpdateTemplateFileInput } from './dto/update-template-file.input';


@Injectable()
export class TemplateFilesService {
  columns: string[] = [];

  constructor(
    @InjectRepository(TemplateFile)
    private repository: Repository<TemplateFile>
  ) {
    this.columns = this.repository.metadata.ownColumns.map(column => column.propertyName);
  }

  create(createTemplateFileInput: CreateTemplateFileInput) {
    return 'This action adds a new templateFile';
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
      // q = q.where(new Brackets(qb => qb
      //   .where('file.title ~* :search', filter.common)
      //   .orWhere('file.name ~* :search', filter.common)));
    if (Array.isArray(filter.common?.ids) && filter.common.ids.length)
      q = q.andWhereInIds(filter.common?.ids);

    if (Array.isArray(filter.templateTypes) && filter.templateTypes.length)
      q = q.andWhere('file.templateType IN (:...templateTypes)', { templateTypes: filter.templateTypes });
    for (const field of ['createdAt', 'updatedAt']) {
      if (Array.isArray(filter[field]) && filter[field].length) {
        for (let idx = 0; idx < filter[field].length; idx++) {
          const halfInterval = filter[field][idx];
          const uniqVarName = field + halfInterval.operator + idx;
          console.log('halfInterval.value', halfInterval.value.toISOString());
          q = q.andWhere(`file.${field} ${Operators[halfInterval.operator]} :${uniqVarName}`,
                         { [uniqVarName]: halfInterval.value.toISOString() });
        }
      }
    }

    if (options.page.sortBy) {
      if (this.columns.some(f => options.page.sortBy.field.startsWith(f))) {  // field can actually be "nested", e.g. file.templateType.id
        q = q.orderBy(`file.${options.page.sortBy.field}`, options.page.sortBy.order);
      } else {
        throw new Error(`sortBy: no such field '${options.page.sortBy.field}'`);
      }
    }
    q = q.skip(options.page.offset)
         .take(options.page.limit);

    // console.log(q.getSql());
    return q.getManyAndCount();
  }

  findOne(id: string, options: FindOneOptions<TemplateFile> = { relations: ['templateType', 'currentFileOfType'] }): Promise<TemplateFile> {
    return this.repository.findOne(id, options);
  }

  update(id: string, updateTemplateFileInput: UpdateTemplateFileInput) {
    return `This action updates a #${id} templateFile`;
  }

  remove(id: string) {
    return `This action removes a #${id} templateFile`;
  }
}
