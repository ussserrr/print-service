import { ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import * as gqlSchema from 'src/graphql';
import * as commonTypes from 'src/common/graphql/types/dto'

import { Owner as dbOwner } from '../entities/entity';


export class FilterDto implements gqlSchema.TemplateTypesFilter {
  @ValidateNested()
  @Type(() => commonTypes.CommonFilterDto)
  common?: commonTypes.CommonFilterDto;

  @ArrayNotEmpty()
  @Transform((value: gqlSchema.Owner[]) => value.map(item => dbOwner[item]))
  owners?: dbOwner[];

  active?: boolean;

  constructor(mapping?: Pick<FilterDto, keyof FilterDto>) {
    if (mapping?.common && !(mapping.common instanceof commonTypes.CommonFilterDto)) {
      this.common = new commonTypes.CommonFilterDto(mapping.common);
      delete mapping.common;
    }
    Object.assign(this, mapping);
  }
}


export class RequestOptionsDto implements gqlSchema.TemplateTypesRequestOptions {
  @ValidateNested()
  @Type(() => commonTypes.PageInputDto)
  page? = new commonTypes.PageInputDto();

  constructor(mapping?: Pick<RequestOptionsDto, keyof RequestOptionsDto>) {
    if (mapping?.page && !(mapping.page instanceof commonTypes.PageInputDto)) {
      this.page = new commonTypes.PageInputDto(mapping.page);
      delete mapping.page;
    }
    Object.assign(this, mapping);
  }
}
