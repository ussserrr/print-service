import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';

import * as gqlSchema from 'src/graphql';

import { TemplateTypesService } from 'src/template-types/service';
import { FindOneDto as TemplateTypesFindOneDto } from 'src/template-types/dto/find-one.output';

import { TemplateFilesService } from './service';
import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { FindOneDto } from './dto/find-one.output';
import { PagedOutputDto } from './dto/page.output';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';


@Resolver('TemplateFile')
export class TemplateFilesResolver implements
  Partial<gqlSchema.IQuery>,
  Partial<gqlSchema.IMutation>
{
  constructor(
    private readonly service: TemplateFilesService,
    private readonly templateTypesService: TemplateTypesService
  ) {}

  @ResolveField('templateType')
  async getTemplateType(@Parent() file: FindOneDto): Promise<TemplateTypesFindOneDto> {
    return new TemplateTypesFindOneDto(await this.templateTypesService.findOne(file.templateType.id));
  }

  // gqlSchema.IMutation
  @Mutation()
  async createTemplateFile(
    @Args('file') filePromise: FileUpload,
    @Args('data') data: CreateDto
  ): Promise<FindOneDto>
  {
    const file = await filePromise;
    // console.log('file', file, 'data', data);
    // return new FindOneDto();
    const created = new FindOneDto(await this.service.create(file, data));
    // console.log('created', created);
    return created;
  }

  // gqlSchema.IQuery
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

  // gqlSchema.IQuery
  @Query()
  async templateFile(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    return new FindOneDto(await this.service.findOne(id));
  }

  // gqlSchema.IMutation
  @Mutation()
  async updateTemplateFile(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('data') data: UpdateDto
  ): Promise<FindOneDto>
  {
    return new FindOneDto(await this.service.update(id, data));
  }

  // gqlSchema.IMutation
  @Mutation()
  async removeTemplateFile(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    return new FindOneDto(await this.service.remove(id));
  }
}
