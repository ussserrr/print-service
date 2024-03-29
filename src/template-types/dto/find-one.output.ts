import { Expose, Type } from 'class-transformer';

import * as gqlSchema from 'src/graphql';

import { FindOneDto as TemplateFileFindOneDto } from 'src/template-files/dto/find-one.output';
import { PagedOutputDto as TemplateFilesPageDto } from 'src/template-files/dto/page.output';


export class FindOneDto implements gqlSchema.TemplateType {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() owner: gqlSchema.Owner;
  @Expose() active: boolean;

  @Expose()
  @Type(() => TemplateFileFindOneDto)
  currentFile?: TemplateFileFindOneDto;

  @Expose()
  @Type(() => TemplateFilesPageDto)
  pageOfFiles?: TemplateFilesPageDto;

  constructor(entity?: Pick<FindOneDto, keyof FindOneDto>) {
    Object.assign(this, entity);
  }
}
