import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';

import * as gqlSchema from 'src/graphql';

import { FindOneDto as TemplateTypeFindOneDto } from 'src/template-types/dto/find-one.output';

import { TemplateFilesService } from './template-files.service';
import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { FindOneDto } from './dto/find-one.output';
import { PagedOutputDto } from './dto/page.output';

// import { CreateTemplateFileInput } from './dto/create.input';
// import { UpdateTemplateFileInput } from './dto/update.input';


@Resolver('TemplateFile')
export class TemplateFilesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly service: TemplateFilesService
  ) {}

  @ResolveField('templateType')
  getTemplateType(@Parent() file: FindOneDto): TemplateTypeFindOneDto {
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
  ): Promise<PagedOutputDto>
  {
    const [ data, count ] = await this.service.findAll(filter, options);
    const response = new PagedOutputDto({
      items: data,
      total: count
    });
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  async templateFile(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    const entity = await this.service.findOne(id);
    if (entity) {
      return new FindOneDto(entity);
    } else {
      throw new NotFoundException();
    }
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
