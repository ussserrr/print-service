import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { TemplateTypesService } from './template-types.service';
import { TemplateType } from './entities/template-type.entity';

import { TemplateFilesService } from 'src/template-files/template-files.service';
import { TemplateFile } from 'src/template-files/entities/template-file.entity';

import * as gqlSchema from 'src/graphql';

import { FilterDto, RequestOptionsDto } from './dto/find-all.input';
import * as templateFilesTypes from 'src/template-files/dto/find-all.input';

// import { CreateTemplateTypeInput } from './dto/create-template-type.input';
// import { UpdateTemplateTypeInput } from './dto/update-template-type.input';


@Resolver('TemplateType')
export class TemplateTypesResolver implements Partial<gqlSchema.IQuery> {
  constructor(
    private readonly templateTypesService: TemplateTypesService,
    private readonly templateFilesService: TemplateFilesService
  ) {}

  @ResolveField('owner')
  getOwner(@Parent() type: TemplateType): gqlSchema.Owner {
    return type.owner.toUpperCase() as gqlSchema.Owner;
  }

  @ResolveField('files')
  async getFilesOf(@Parent() type: TemplateType): Promise<gqlSchema.TemplateFilesPageResult> {
    // console.log('getFilesOf', type instanceof TemplateType, type);

    // if (type.shouldJoinFiles &&
    //     (!type.files || (Array.isArray(type.files) && type.files.length === 0))
    // ) {
      const filter = new templateFilesTypes.FilterDto({
        templateTypes: [type.id]
      });
      const options = new templateFilesTypes.RequestOptionsDto({
        page: {
          // Use defaults for limit/offset
          sortBy: {
            field: 'updatedAt',
            order: gqlSchema.SortOrder.DESC
          }
        }
      });
      const [ data, count ] = await this.templateFilesService.findAll(filter, options);
      return {
        items: data,
        total: count
      };
    // } else {
    //   return type.files;
    // }
  }

  @ResolveField('currentFile')
  getCurrentFileOf(@Parent() type: TemplateType): TemplateFile {
    // console.log('currentFile', type);
    return type.currentFile;
    // if (type.currentFile) {
    //   return this.templateFilesService.findOne(type.currentFile.id);
    // }
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
  ): Promise<gqlSchema.TemplateTypesPageResult>
  {
    // console.log('templateTypes', filter, options);
    const [ data, count ] = await this.templateTypesService.findAll(filter, options);

    // if (options.listFiles) {
    //   data.forEach(type => type.shouldJoinFiles = true);  // TODO: this is HACK
    // }

    const response = {
      items: data,
      total: count
    };
    // console.log('templateTypes', data);
    return response;
  }

  // Part of the IQuery, so the name should be the same as the field
  @Query()
  templateType(@Args('id', ParseUUIDPipe) id: string): Promise<TemplateType> {
    return this.templateTypesService.findOne(id);
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
