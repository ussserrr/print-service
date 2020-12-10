import { Expose, Transform, Type } from 'class-transformer';

import * as gqlSchema from 'src/graphql';

import { FindOneDto as TemplateTypeFindOneDto } from 'src/template-types/dto/find-one.output';

import { TemplateFile } from '../entities/template-file.entity';


export class FindOneDto implements gqlSchema.TemplateFile {
  @Expose() id!: string;
  @Expose() title!: string;
  @Expose() mimeType!: string;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Expose()
  @Type(() => TemplateTypeFindOneDto)
  templateType!: TemplateTypeFindOneDto;

  @Expose({ name: 'isCurrentFileOfItsType' })
  @Transform(value => value ? true : false)
  currentFileOfType?: TemplateTypeFindOneDto;

  constructor(other?: Partial<TemplateFile>) {
    Object.assign(this, other);
  }
}
