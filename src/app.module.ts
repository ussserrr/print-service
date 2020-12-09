import { join } from "path";

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TemplateFilesModule } from './template-files/template-files.module';
import { TemplateTypesModule } from './template-types/template-types.module';

import { TemplateFile } from "./template-files/entities/template-file.entity";
import { TemplateType } from "./template-types/entities/template-type.entity";

import { TemplateFilesService } from "./template-files/template-files.service";
import { TemplateTypesService } from "./template-types/template-types.service";


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'chufyrev',
      database: 'chufyrev',
      synchronize: true,
      entities: [TemplateFile, TemplateType]
    }),
    GraphQLModule.forRoot({
      typePaths: ['./src/**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts')  // runtime-generated file
      }
    }),

    TemplateFilesModule,
    TemplateTypesModule
  ],
  controllers: [AppController],
  providers: [AppService, TemplateTypesService, TemplateFilesService],
  exports: [AppService, TypeOrmModule, TemplateTypesService, TemplateFilesService]
})
export class AppModule {}
