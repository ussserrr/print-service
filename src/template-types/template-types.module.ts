import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemplateTypesResolver } from './template-types.resolver';

import { TemplateTypesService } from './template-types.service';
import { TemplateFilesService } from 'src/template-files/template-files.service';

import { TemplateType } from './entities/template-type.entity';
import { TemplateFile } from 'src/template-files/entities/template-file.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ TemplateType, TemplateFile ]), TemplateFilesService],
  providers: [TemplateTypesResolver, TemplateTypesService, TemplateFilesService],
  exports: [TemplateTypesService, TypeOrmModule]
})
export class TemplateTypesModule {}
