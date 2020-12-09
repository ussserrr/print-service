import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { TemplateFilesService } from './template-files.service';
import { TemplateFile } from './entities/template-file.entity';

import { TemplateType } from 'src/template-types/entities/template-type.entity';

import * as gqlSchema from 'src/graphql';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

// import { CreateTemplateFileInput } from './dto/create-template-file.input';
// import { UpdateTemplateFileInput } from './dto/update-template-file.input';


@Resolver('TemplateFile')
export class TemplateFilesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('templateType')
  getTemplateType(@Parent() file: TemplateFile): TemplateType {
    return file.templateType;
  }

  // @Mutation('createTemplateFile')
  // create(@Args('createTemplateFileInput') createTemplateFileInput: CreateTemplateFileInput) {
  //   return this.templateFilesService.create(createTemplateFileInput);
  // }

  // Part of the IQuery, so the name of function should be the same as of query field
  @Query()
  async templateFiles(
    @Args('filter') filter: FilterDto,
    @Args('options') options: RequestOptionsDto
  ): Promise<gqlSchema.TemplateFilesPageResult>
  {
    // console.log('templateFiles', filter, options);
    const [ data, count ] = await this.templateFilesService.findAll(filter, options);
    const response = {
      items: data,
      total: count
    };
    // console.log('templateFiles', data);
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  templateFile(@Args('id', ParseUUIDPipe) id: string): Promise<TemplateFile> {
    return this.templateFilesService.findOne(id);
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
