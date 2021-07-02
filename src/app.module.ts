import * as fs from 'fs';
import * as path from 'path';

import { Inject, Logger, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { GraphQLModule } from '@nestjs/graphql';
import { graphqlUploadExpress } from 'graphql-upload';

import { ConfigModule, ConfigType } from '@nestjs/config';

import { BullModule } from '@nestjs/bull';

import { ServeStaticModule } from '@nestjs/serve-static';

import appConfig from './config/app.config';
import dbConfig from './config/database.config';
import queueConfig from 'src/config/queue.config';
import printConfig from 'src/config/print.config';
import graphqlConfig from './config/graphql.config';

import { AppController } from './app.controller';

import { TemplateFile } from './template-files/entities/entity';
import { TemplateFilesModule } from './template-files/module';
import { TemplateFilesService } from './template-files/service';

import { TemplateTypesModule } from './template-types/module';
import { TemplateTypesService } from './template-types/service';

import { PrintModule } from './print/module';
import { PrintService } from './print/service';
import { PrintController } from './print/controller';
import { TemplateType } from './template-types/entities/entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, printConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(dbConfig)],
      inject: [dbConfig.KEY],
      useFactory: (config: ConfigType<typeof dbConfig>) => ({
        ...config,
        entities: [
          TemplateFile,
          TemplateType
        ]
      })
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      inject: [queueConfig.KEY],
      useFactory: (config: ConfigType<typeof queueConfig>) => config
    }),
    GraphQLModule.forRoot(graphqlConfig),
    TemplateFilesModule,
    TemplateTypesModule,
    PrintModule,
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: (config: ConfigType<typeof appConfig>) => new Promise(r => r([{
        rootPath: path.join(__dirname, '..', 'docs'),
        serveRoot: config.urlPrefix + '/docs'
      }]))
    })
  ],
  controllers: [
    AppController,
    PrintController
  ],
  providers: [
    TemplateTypesService,
    TemplateFilesService,
    PrintService
  ],
  exports: [
    TypeOrmModule,
    TemplateTypesService,
    TemplateFilesService,
    PrintService
  ]
})
export class AppModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }

  onModuleInit() {
    try {
      fs.accessSync(this.config.storagePath, fs.constants.F_OK);
    } catch {
      this.logger.warn(`app.config.storagePath path (${this.config.storagePath}) doesn't exist, creating one...`);
      fs.mkdirSync(this.config.storagePath, { recursive: true });
    }
    // Check we have necessary file-system permissions (read/write)
    fs.accessSync(this.config.storagePath, fs.constants.R_OK | fs.constants.W_OK);
  }
}
