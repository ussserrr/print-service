import * as gqlSchema from 'src/graphql';
import * as commonTypes from 'src/common/graphql/types/dto'
import { ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class FilterDto implements gqlSchema.TemplateTypesFilter {
  @ValidateNested()
  @Type(() => commonTypes.CommonFilterDto)
  common?: commonTypes.CommonFilterDto;

  @ArrayNotEmpty() owners?: gqlSchema.Owner[];  // TODO test this validation
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

  listFiles: boolean;

  constructor(mapping?: Pick<RequestOptionsDto, keyof RequestOptionsDto>) {
    if (mapping?.page && !(mapping.page instanceof commonTypes.PageInputDto)) {
      this.page = new commonTypes.PageInputDto(mapping.page);
      delete mapping.page;
    }
    Object.assign(this, mapping);
  }
}
