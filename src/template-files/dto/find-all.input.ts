import * as gqlSchema from 'src/graphql';
import * as commonTypes from 'src/common/graphql/types/dto'
import { ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class FilterDto implements gqlSchema.TemplateFilesFilter {
  @ValidateNested()
  @Type(() => commonTypes.CommonFilterDto)
  common?: commonTypes.CommonFilterDto;

  @ArrayNotEmpty()
  templateTypes?: string[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => commonTypes.DateFilterDto)
  createdAt?: commonTypes.DateFilterDto[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => commonTypes.DateFilterDto)
  updatedAt?: commonTypes.DateFilterDto[];

  constructor(mapping?: Pick<FilterDto, keyof FilterDto>) {
    if (mapping?.common && !(mapping.common instanceof commonTypes.CommonFilterDto)) {
      this.common = new commonTypes.CommonFilterDto(mapping.common);
      delete mapping.common;
    }
    Object.assign(this, mapping);
  }
}


export class RequestOptionsDto implements gqlSchema.TemplateFilesRequestOptions {
  @ValidateNested()
  @Type(() => commonTypes.PageInputDto)
  page? = new commonTypes.PageInputDto();

  constructor(map?: Pick<RequestOptionsDto, keyof RequestOptionsDto>) {
    if (map?.page && !(map.page instanceof commonTypes.PageInputDto)) {
      this.page = new commonTypes.PageInputDto(map.page);
      delete map.page;
    }
    Object.assign(this, map);
  }
}
