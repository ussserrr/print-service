import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';

import { TemplateFilesService } from 'src/template-files/template-files.service';

import { TemplateTypesService } from './template-types.service';
import * as gqlSchema from "src/graphql";

// import { CreateTemplateTypeInput } from './dto/create-template-type.input';
// import { UpdateTemplateTypeInput } from './dto/update-template-type.input';


@Resolver('TemplateType')
export class TemplateTypesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly templateTypesService: TemplateTypesService,
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('owner')
  getOwner(@Parent() type: gqlSchema.TemplateType): gqlSchema.Owner {
    return type.owner.toUpperCase() as gqlSchema.Owner;
  }

  @ResolveField('files')
  async getFilesOf(@Parent() type: gqlSchema.TemplateType): Promise<gqlSchema.TemplateFile[]> {
    const filter = new gqlSchema.TemplateFilesFilter();
    filter.templateTypes = [type.id];
    const page = new gqlSchema.PageInput();
    page.limit = 10;
    page.offset = 0;
    const options = new gqlSchema.TemplateFilesRequestOptions();
    options.page = page;
    const [ data, ] = await this.templateFilesService.findAll(filter, options);
    return data;
  }

  @ResolveField('currentFile')
  getCurrentFileOf(@Parent() type: gqlSchema.TemplateType): Promise<gqlSchema.TemplateFile | undefined> {
    // console.log('asas', type);
    if (type.currentFile) {
      return this.templateFilesService.findOne(type.currentFile.id);
    }
  }

  // @Mutation('createTemplateType')
  // create(@Args('createTemplateTypeInput') createTemplateTypeInput: CreateTemplateTypeInput) {
  //   return this.templateTypesService.create(createTemplateTypeInput);
  // }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  async templateTypes(
    @Args('filter') filter: gqlSchema.TemplateTypesFilter,
    @Args('options') options: gqlSchema.TemplateTypesRequestOptions
  ): Promise<gqlSchema.TemplateTypesPageResult> {
    console.log('templateTypes', filter, options);
    const [ data, count ] = await this.templateTypesService.findAll(filter, options);
    const response = new gqlSchema.TemplateTypesPageResult();
    // console.log('templateTypes', data);
    response.items = data;
    response.total = count;
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  templateType(@Args('id') id: string): Promise<gqlSchema.TemplateType> {
    return this.templateTypesService.findOne(id, ['currentFile', 'files']);
  }

  // @Mutation('updateTemplateType')
  // update(@Args('updateTemplateTypeInput') updateTemplateTypeInput: UpdateTemplateTypeInput) {
  //   return this.templateTypesService.update(updateTemplateTypeInput.id, updateTemplateTypeInput);
  // }

  // @Mutation('removeTemplateType')
  // remove(@Args('id') id: string) {
  //   return this.templateTypesService.remove(id);
  // }
}
