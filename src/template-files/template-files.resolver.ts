import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';

import { TemplateFilesService } from './template-files.service';

import { TemplateTypesService } from 'src/template-types/template-types.service';
import * as gqlSchema from "src/graphql";

// import { CreateTemplateFileInput } from './dto/create-template-file.input';
// import { UpdateTemplateFileInput } from './dto/update-template-file.input';


@Resolver('TemplateFile')
export class TemplateFilesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly templateFilesService: TemplateFilesService,
    private readonly templateTypesService: TemplateTypesService
  ) {}

  @ResolveField('templateType')
  getTemplateType(@Parent() file: gqlSchema.TemplateFile) {
    return this.templateTypesService.findOne(file.templateType.id);
  }

  // @Mutation('createTemplateFile')
  // create(@Args('createTemplateFileInput') createTemplateFileInput: CreateTemplateFileInput) {
  //   return this.templateFilesService.create(createTemplateFileInput);
  // }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  async templateFiles(
    @Args('filter') filter?: gqlSchema.TemplateFilesFilter,
    @Args('options') options?: gqlSchema.TemplateFilesRequestOptions
  ): Promise<gqlSchema.TemplateFilesPageResult> {
    console.log('templateFiles', filter, options);
    const [ data, count ] = await this.templateFilesService.findAll(filter, options);
    const response = new gqlSchema.TemplateFilesPageResult();
    console.log('templateFiles', data);
    response.items = data;
    response.total = count;
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  templateFile(@Args('id') id: string): Promise<gqlSchema.TemplateFile> {
    return this.templateFilesService.findOne(id, ['templateType', 'currentFileOfType']);
  }

  // @Mutation('updateTemplateFile')
  // update(@Args('updateTemplateFileInput') updateTemplateFileInput: UpdateTemplateFileInput) {
  //   return this.templateFilesService.update(updateTemplateFileInput.id, updateTemplateFileInput);
  // }

  // @Mutation('removeTemplateFile')
  // remove(@Args('id') id: string) {
  //   return this.templateFilesService.remove(id);
  // }
}
