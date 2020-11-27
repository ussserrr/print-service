import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemplateFilesResolver } from './template-files.resolver';

import { TemplateFilesService } from './template-files.service';
import { TemplateTypesService } from 'src/template-types/template-types.service';

import { TemplateFile } from './entities/template-file.entity';
import { TemplateType } from 'src/template-types/entities/template-type.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ TemplateFile, TemplateType ]), TemplateTypesService],
  providers: [TemplateFilesResolver, TemplateFilesService, TemplateTypesService],
  exports: [TemplateFilesService, TypeOrmModule]
})
export class TemplateFilesModule {}
