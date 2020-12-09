import * as gqlSchema from 'src/graphql';
import * as commonTypes from 'src/common/types/dto'
import { ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class FilterDto implements gqlSchema.TemplateTypesFilter {
  @ValidateNested()
  @Type(() => commonTypes.CommonFilterDto)
  common?: commonTypes.CommonFilterDto;

  @ArrayNotEmpty() owners?: gqlSchema.Owner[];
  active?: boolean;

  constructor(map?: Pick<FilterDto, keyof FilterDto>) {
    if (map?.common && !(map.common instanceof commonTypes.CommonFilterDto)) {
      this.common = new commonTypes.CommonFilterDto(map.common);
      delete map.common;
    }
    Object.assign(this, map);
  }
}


export class RequestOptionsDto implements gqlSchema.TemplateTypesRequestOptions {
  @ValidateNested()
  @Type(() => commonTypes.PageInputDto)
  page? = new commonTypes.PageInputDto();

  listFiles!: boolean;

  constructor(map?: Pick<RequestOptionsDto, keyof RequestOptionsDto>) {
    if (map?.page && !(map.page instanceof commonTypes.PageInputDto)) {
      this.page = new commonTypes.PageInputDto(map.page);
      delete map.page;
    }
    Object.assign(this, map);
  }
}
