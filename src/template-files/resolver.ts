import { Resolver, Query, Mutation, Args, Parent, ResolveField, CONTEXT } from '@nestjs/graphql';
import { Inject, Injectable, ParseUUIDPipe, Scope } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';

import * as gqlSchema from 'src/graphql';
import { AppGraphQLContext } from 'src/app.module';

import { TemplateTypesService } from 'src/template-types/service';
import { FindOneDto as TemplateTypesFindOneDto } from 'src/template-types/dto/find-one.output';

import { TemplateFilesService } from './service';
import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { FindOneDto } from './dto/find-one.output';
import { PagedOutputDto } from './dto/page.output';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';


@Injectable({ scope: Scope.REQUEST })
@Resolver('TemplateFile')
export class TemplateFilesResolver implements
  Partial<gqlSchema.IQuery>,
  Partial<gqlSchema.IMutation>
{
  constructor(
    private readonly service: TemplateFilesService,
    private readonly templateTypesService: TemplateTypesService,
    @Inject(CONTEXT) private readonly requestContext: AppGraphQLContext
  ) {}

  @ResolveField('templateType')
  async getTemplateTypeOf(@Parent() file: FindOneDto): Promise<TemplateTypesFindOneDto> {
    return new TemplateTypesFindOneDto(await this.templateTypesService.findOne(file.templateType.id));
  }

  @ResolveField('mimeType')
  getMimeType(@Parent() file: FindOneDto): string {
    return this.service.convertMimeTypeToExtension(file.mimeType);
  }

  // gqlSchema.IMutation
  @Mutation()
  async createTemplateFile(
    @Args('file') fileUpload: FileUpload,
    @Args('data') input: CreateDto
  ): Promise<FindOneDto>
  {
    const uploadedFile = await fileUpload;
    const [created, warnings] = await this.service.create(uploadedFile, input);
    this.requestContext.warnings.push(...warnings);
    return new FindOneDto(created);
  }

  // gqlSchema.IQuery
  @Query()
  async templateFiles(
    @Args('filter') filter: FilterDto,
    @Args('options') options: RequestOptionsDto
  ): Promise<PagedOutputDto>
  {
    const [ files, count ] = await this.service.findAll(filter, options);
    return new PagedOutputDto({
      items: files,
      total: count
    });
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
    @Args('data') input: UpdateDto
  ): Promise<FindOneDto>
  {
    const [updated, warnings] = await this.service.update(id, input);
    this.requestContext.warnings.push(...warnings);
    return new FindOneDto(updated);
  }

  // gqlSchema.IMutation
  @Mutation()
  async removeTemplateFile(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    const [removed, warnings] = await this.service.remove(id);
    this.requestContext.warnings.push(...warnings);
    return new FindOneDto(removed);
  }

}
