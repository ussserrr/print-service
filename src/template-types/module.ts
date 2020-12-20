import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common/utils/forward-ref.util';
import { ConfigModule } from '@nestjs/config';

import appConfig from 'src/config/app.config';

import { TemplateFile } from 'src/template-files/entities/entity';
import { TemplateFilesModule } from 'src/template-files/module';
import { TemplateFilesService } from 'src/template-files/service';

import { TemplateType } from './entities/entity';
import { TemplateTypesService } from './service';
import { TemplateTypesResolver } from './resolver';


@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([TemplateFile, TemplateType]),
    forwardRef(() => TemplateFilesModule)
  ],
  providers: [
    TemplateTypesResolver,
    TemplateTypesService,
    TemplateFilesService
  ],
  exports: [
    TemplateTypesService,
    TypeOrmModule
  ]
})
export class TemplateTypesModule {}
