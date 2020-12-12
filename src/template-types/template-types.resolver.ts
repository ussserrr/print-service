import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';

import * as gqlSchema from 'src/graphql';

import { FindOneDto as TemplateFilesFindOneDto } from 'src/template-files/dto/find-one.output';
import { TemplateFilesService } from 'src/template-files/template-files.service';
import { PagedOutputDto as TemplateFilesPageDto } from 'src/template-files/dto/page.output';
import {
  FilterDto as TemplateFilesFilterDto,
  RequestOptionsDto as TemplateFilesRequestOptionsDto
} from 'src/template-files/dto/find-all.input';

import { TemplateTypesService } from './template-types.service';
import { FilterDto, RequestOptionsDto } from './dto/find-all.input';

import { FindOneDto } from './dto/find-one.output';
import { PagedOutputDto } from './dto/page.output';

// import { CreateTemplateTypeInput } from './dto/create.input';
// import { UpdateTemplateTypeInput } from './dto/update.input';


@Resolver('TemplateType')
export class TemplateTypesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly service: TemplateTypesService,
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('owner')
  getOwner(@Parent() type: Pick<FindOneDto, keyof FindOneDto>): gqlSchema.Owner {
    return type.owner.toUpperCase() as gqlSchema.Owner;
  }

  @ResolveField('pageOfFiles')
  async getFilesOf(@Parent() type: Pick<FindOneDto, keyof FindOneDto>): Promise<TemplateFilesPageDto> {
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
    const response = new TemplateFilesPageDto({
      items: data,
      total: count
    });
    return response;
  }

  @ResolveField('currentFile')
  getCurrentFileOf(@Parent() type: FindOneDto): TemplateFilesFindOneDto {  // TODO: annotate type: FindOneDto (currently complains on incompatible types)
    return new TemplateFilesFindOneDto(type.currentFile);
  }

  // @Mutation('createTemplateType')
  // create(@Args('createTemplateTypeInput') createTemplateTypeInput: CreateTemplateTypeInput) {
  //   return this.templateTypesService.create(createTemplateTypeInput);
  // }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  async templateTypes(
    @Args('filter') filter: FilterDto,
    @Args('options') options: RequestOptionsDto
  ): Promise<PagedOutputDto> {
    const [ data, count ] = await this.service.findAll(filter, options);
    const response = new PagedOutputDto({
      items: data,
      total: count
    });
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  async templateType(@Args('id', ParseUUIDPipe) id: string): Promise<FindOneDto> {
    const entity = await this.service.findOne(id);
    if (entity) {
      return new FindOneDto(entity);
    } else {
      throw new NotFoundException();
    }
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
