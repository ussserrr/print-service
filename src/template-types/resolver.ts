import { Resolver, Query, Mutation, Args, Parent, Context, ResolveField } from '@nestjs/graphql';
import { ParseUUIDPipe, SerializeOptions } from '@nestjs/common';

import * as gqlSchema from 'src/graphql';

import { FindOneDto as TemplateFilesFindOneDto } from 'src/template-files/dto/find-one.output';
import { TemplateFilesService } from 'src/template-files/service';
import { PagedOutputDto as TemplateFilesPageDto } from 'src/template-files/dto/page.output';
import {
  FilterDto as TemplateFilesFilterDto,
  RequestOptionsDto as TemplateFilesRequestOptionsDto
} from 'src/template-files/dto/find-all.input';

import { TemplateTypesService } from './service';
import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { FindOneDto } from './dto/find-one.output';
import { PagedOutputDto } from './dto/page.output';
import { CreateDto } from './dto/create.input';
import { UpdateDto } from './dto/update.input';



@Resolver('TemplateType')
export class TemplateTypesResolver implements
  Partial<gqlSchema.IQuery>,
  Partial<gqlSchema.IMutation>
{
  constructor(
    private readonly service: TemplateTypesService,
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('owner')
  getOwner(@Parent() type: FindOneDto): gqlSchema.Owner {
    return type.owner.toUpperCase() as gqlSchema.Owner;
  }

  @ResolveField('pageOfFiles')
  async getFilesOf(@Parent() type: FindOneDto): Promise<TemplateFilesPageDto> {
    if (type['_removed']) {
      // Special case: when we deleting the entity its files doesn't exist anymore as well
      // so we "cache" them (to return back to the caller) at the "files" field and mark the
      // object as "_removed". It isn't particularly type-safe so consider it as a little "hack".
      // Also the client cannot (and should not) request nested fields as any try to access
      // these objects will fail
      return new TemplateFilesPageDto({
        items: type['files'],
        total: type['files'].length
      });
    }

    const filter = new TemplateFilesFilterDto({
      templateTypes: [type.id]
    });
    const options = new TemplateFilesRequestOptionsDto({
      page: {
        // Use defaults for limit/offset
        sortBy: {
          field: 'updatedAt',
          order: gqlSchema.SortOrder.DESC
        }
      }
    });
    const [ data, count ] = await this.templateFilesService.findAll(filter, options);
    return new TemplateFilesPageDto({
      items: data,
      total: count
    });
  }

  @ResolveField('currentFile')
  async getCurrentFileOf(@Parent() type: FindOneDto): Promise<TemplateFilesFindOneDto | undefined> {
    if (type['_removed']) {
      // Special case: when we deleting the entity its current file doesn't exist anymore as well
      // so we "cache" it (to return back to the caller) and mark the whole object as "_removed".
      // It isn't particularly type-safe so consider it as a little "hack". Also the client cannot
      // (and should not) request nested fields as any try to access these objects will fail
      return new TemplateFilesFindOneDto(type.currentFile);
    }

    if (type.currentFile?.id) {
      return new TemplateFilesFindOneDto(await this.templateFilesService.findOne(type.currentFile.id));
    }
  }

  // gqlSchema.IMutation
  @Mutation()
  async createTemplateType(@Args('data') input: CreateDto): Promise<FindOneDto> {
    return new FindOneDto(await this.service.create(input));
  }

  // gqlSchema.IQuery
  @Query()
  async templateTypes(
    @Args('filter') filter: FilterDto,
    @Args('options') options: RequestOptionsDto
  ): Promise<PagedOutputDto> {
    const [ data, count ] = await this.service.findAll(filter, options);
    return new PagedOutputDto({
      items: data,
      total: count
    });
  }

  // gqlSchema.IQuery
  @Query()
  async templateType(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    return new FindOneDto(await this.service.findOne(id));
  }

  // This is a part of gqlSchema.IQuery as well but we lose the exact signature introducing the @Context()
  @Mutation('updateTemplateType')
  async update(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('data') input: UpdateDto,
    @Context() ctx
  ): Promise<FindOneDto>
  {
    if (!Array.isArray(ctx.warnings)) {
      ctx.warnings = [];
    }
    return new FindOneDto(await this.service.update(id, input, ctx.warnings));
  }

  // gqlSchema.IMutation
  @SerializeOptions({ strategy: 'exposeAll' })
  @Mutation()
  async removeTemplateType(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    return new FindOneDto(await this.service.remove(id));
  }
}
