import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';

import { TemplateTypesService } from './template-types.service';

import { TemplateFilesService } from 'src/template-files/template-files.service';

// import { CreateTemplateTypeInput } from './dto/create-template-type.input';
// import { UpdateTemplateTypeInput } from './dto/update-template-type.input';


@Resolver('TemplateType')
export class TemplateTypesResolver {
  constructor(
    private readonly templateTypesService: TemplateTypesService,
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('files')
  getFiles(@Parent() type) {
    const { id } = type;
    return this.templateFilesService.findAll();
  }

  @ResolveField('currentFile')
  getCurrentFile(@Parent() type) {
    const { id } = type;
    return this.templateFilesService.findOne(id);
  }

  // @Mutation('createTemplateType')
  // create(@Args('createTemplateTypeInput') createTemplateTypeInput: CreateTemplateTypeInput) {
  //   return this.templateTypesService.create(createTemplateTypeInput);
  // }

  @Query('templateTypes')
  findAll() {
    return this.templateTypesService.findAll();
  }

  @Query('templateType')
  findOne(@Args('id') id: number) {
    return this.templateTypesService.findOne(id);
  }

  // @Mutation('updateTemplateType')
  // update(@Args('updateTemplateTypeInput') updateTemplateTypeInput: UpdateTemplateTypeInput) {
  //   return this.templateTypesService.update(updateTemplateTypeInput.id, updateTemplateTypeInput);
  // }

  // @Mutation('removeTemplateType')
  // remove(@Args('id') id: number) {
  //   return this.templateTypesService.remove(id);
  // }
}
