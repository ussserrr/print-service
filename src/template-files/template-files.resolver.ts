import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';

import { TemplateTypesService } from 'src/template-types/template-types.service';

import { TemplateFilesService } from './template-files.service';

// import { CreateTemplateFileInput } from './dto/create-template-file.input';
// import { UpdateTemplateFileInput } from './dto/update-template-file.input';


@Resolver('TemplateFile')
export class TemplateFilesResolver {
  constructor(
    private readonly templateFilesService: TemplateFilesService,
    private readonly templateTypesService: TemplateTypesService
  ) {}

  @ResolveField('templateType')
  getTemplateType(@Parent() file) {
    const { id } = file;
    return this.templateTypesService.findOne(id);
  }

  @ResolveField('currentFileOfType')
  getCurrentFileOfType(@Parent() file) {  // TODO: try to assign multiple ResolveField() to single resolver
    const { id } = file;
    return this.templateTypesService.findOne(id);
  }

  // @Mutation('createTemplateFile')
  // create(@Args('createTemplateFileInput') createTemplateFileInput: CreateTemplateFileInput) {
  //   return this.templateFilesService.create(createTemplateFileInput);
  // }

  @Query('templateFiles')
  findAll() {
    return this.templateFilesService.findAll();
  }

  @Query('templateFile')
  findOne(@Args('id') id: number) {
    return this.templateFilesService.findOne(id);
  }

  // @Mutation('updateTemplateFile')
  // update(@Args('updateTemplateFileInput') updateTemplateFileInput: UpdateTemplateFileInput) {
  //   return this.templateFilesService.update(updateTemplateFileInput.id, updateTemplateFileInput);
  // }

  // @Mutation('removeTemplateFile')
  // remove(@Args('id') id: number) {
  //   return this.templateFilesService.remove(id);
  // }
}
