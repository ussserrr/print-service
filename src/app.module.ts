import * as fs from 'fs';
import * as path from 'path';

import { Inject, Module, OnModuleInit } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';
import { ContextFunction } from 'apollo-server-core';
import GraphQLJSON from 'graphql-type-json';

import { ConfigModule, ConfigType } from '@nestjs/config';

import { BullModule } from '@nestjs/bull';

import appConfig from './config/app.config';
import dbConfig from './config/database.config';
import queueConfig from 'src/config/queue.config';
import printConfig from 'src/config/print.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TemplateFile } from './template-files/entities/entity';
import { TemplateFilesModule } from './template-files/module';
import { TemplateFilesService } from './template-files/service';

import { TemplateTypesModule } from './template-types/module';
import { TemplateTypesService } from './template-types/service';

import { PrintModule } from './print/module';
import { PrintService } from './print/service';
import { PrintController } from './print/controller';


export interface AppGraphQLContext {
  warnings: string[];
  templateType?: {
    isRemoved: boolean;
    filesOfRemoved: TemplateFile[]
  }
}
const contextFactory: ContextFunction<any, AppGraphQLContext> = () => ({
  warnings: []
});

const graphqlConfig: GqlModuleOptions = {
  context: contextFactory,
  formatResponse: (
    response: GraphQLResponse | null,
    ctx: GraphQLRequestContext<AppGraphQLContext>,
  ): GraphQLResponse =>
  {
    // console.log('formatResponse', response);
    const warnings = ctx.context.warnings;
    if (warnings.length) {
      if (response) {
        const extensions = response.extensions || (response.extensions = {});
        extensions.warnings = warnings;
      } else {
        return { extensions: { warnings } };
      }
    }
    return response || {};
  },
  // TODO: test again when there are multiple errors (e.g. graphql validation errors)
  // TODO: test when debug=false
  // TODO: probably use 'extensions', too
  formatError: (error: GraphQLError): GraphQLFormattedError => {
    const errorType =
      error.extensions?.exception?.response?.error ||
      'Error';

    let errorMessage = 'unknown error';
    if (Array.isArray(error.extensions?.exception?.response?.message)) {
      errorMessage = error.extensions?.exception?.response?.message.join('; ');  // TODO: this isn't good...
    } else if (error.extensions?.exception?.response?.message) {
      errorMessage = error.extensions?.exception?.response?.message;
    } else if (error.extensions?.exception?.message) {
      errorMessage = error.extensions?.exception?.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    let message = `${errorType}: ${errorMessage}`;
    if (Array.isArray(error.path) && error.path.length) {
      // Sometimes present when walking GraphQL graph
      message = message + ` (${error.path.join('.')})`;
    }

    const formattedError: GraphQLFormattedError = {
      message: message
    };
    return formattedError;
  },
  typePaths: ['./**/*.graphql'],
  resolvers: { JSON: GraphQLJSON },

  /**
   * WARNING: make sure this config is matching the one from the typings generation
   * standalone script otherwise you can meet some unexpected behavior
   */
  definitions: {
    path: path.join(process.cwd(), 'src', 'graphql.ts'),  // runtime-generated file
    defaultScalarType: 'unknown',
    customScalarTypeMapping: {
      'Upload': 'FileUpload'
    },
    additionalHeader: 'import { FileUpload } from "graphql-upload";'
  }
};


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, printConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(dbConfig)],
      inject: [dbConfig.KEY],
      useFactory: (config: ConfigType<typeof dbConfig>) => config
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      inject: [queueConfig.KEY],
      useFactory: (config: ConfigType<typeof queueConfig>) => config
    }),
    GraphQLModule.forRoot(graphqlConfig),
    TemplateFilesModule,
    TemplateTypesModule,
    PrintModule
  ],
  controllers: [
    AppController,
    PrintController
  ],
  providers: [
    AppService,
    TemplateTypesService,
    TemplateFilesService,
    PrintService
  ],
  exports: [
    AppService,
    TypeOrmModule,
    TemplateTypesService,
    TemplateFilesService,
    PrintService
  ]
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
  ) {}

  onModuleInit() {
    try {
      fs.accessSync(this.config.storageRootPath, fs.constants.F_OK);
    } catch {
      console.info(`app.config.storageRootPath path (${this.config.storageRootPath}) doesn't exist, creating one...`);
      fs.mkdirSync(this.config.storageRootPath, { recursive: true });
    }
    // Check we have necessary file-system permissions (read/write)
    fs.accessSync(this.config.storageRootPath, fs.constants.R_OK | fs.constants.W_OK);
  }
}
