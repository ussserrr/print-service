import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common/utils/forward-ref.util';
import { ConfigModule } from '@nestjs/config';

import appConfig from 'src/config/app.config';

import { TemplateTypesModule } from 'src/template-types/module';
import { TemplateTypesService } from 'src/template-types/service';

import { TemplateFile } from './entities/entity';
import { TemplateFilesService } from './service';
import { TemplateFilesResolver } from './resolver';

import { PrintModule } from 'src/print/module';
import { PrintService } from 'src/print/service';


@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([TemplateFile]),
    forwardRef(() => TemplateTypesModule),
    PrintModule
  ],
  providers: [
    TemplateFilesResolver,
    TemplateFilesService,
    TemplateTypesService,
    PrintService
  ],
  exports: [
    TypeOrmModule,
    TemplateFilesService,
    PrintService
  ]
})
export class TemplateFilesModule {}
