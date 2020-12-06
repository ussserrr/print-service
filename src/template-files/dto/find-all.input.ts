import * as gqlSchema from 'src/graphql';

export class FilterDto {

}

export class FindAllDto {
  filter?: gqlSchema.TemplateFilesFilter
  options?: gqlSchema.TemplateFilesRequestOptions
}
