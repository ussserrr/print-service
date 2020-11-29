import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common/utils/forward-ref.util';

import { TemplateTypesModule } from 'src/template-types/template-types.module';
import { TemplateTypesService } from 'src/template-types/template-types.service';

import { TemplateFile } from './entities/template-file.entity';
import { TemplateFilesService } from './template-files.service';
import { TemplateFilesResolver } from './template-files.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateFile]),
    forwardRef(() => TemplateTypesModule)
  ],
  providers: [TemplateFilesResolver, TemplateFilesService, TemplateTypesService],
  exports: [TemplateFilesService, TypeOrmModule]
})
export class TemplateFilesModule {}
