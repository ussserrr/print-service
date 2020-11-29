import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common/utils/forward-ref.util';

import { TemplateFilesModule } from 'src/template-files/template-files.module';
import { TemplateFilesService } from 'src/template-files/template-files.service';

import { TemplateType } from './entities/template-type.entity';
import { TemplateTypesService } from './template-types.service';
import { TemplateTypesResolver } from './template-types.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateType]),
    forwardRef(() => TemplateFilesModule)
  ],
  providers: [TemplateTypesResolver, TemplateTypesService, TemplateFilesService],
  exports: [TemplateTypesService, TypeOrmModule]
})
export class TemplateTypesModule {}
