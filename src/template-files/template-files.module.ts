import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemplateType } from 'src/template-types/entities/template-type.entity';
import { TemplateTypesService } from 'src/template-types/template-types.service';

import { TemplateFile } from './entities/template-file.entity';
import { TemplateFilesService } from './template-files.service';
import { TemplateFilesResolver } from './template-files.resolver';


@Module({
  imports: [TypeOrmModule.forFeature([ TemplateFile, TemplateType ]), TemplateTypesService],
  providers: [TemplateFilesResolver, TemplateFilesService, TemplateTypesService],
  exports: [TemplateFilesService, TypeOrmModule]
})
export class TemplateFilesModule {}
