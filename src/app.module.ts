import { join } from 'path';

import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TemplateFilesModule } from './template-files/template-files.module';
import { TemplateTypesModule } from './template-types/template-types.module';

import { TemplateFile } from './template-files/entities/template-file.entity';
import { TemplateType } from './template-types/entities/template-type.entity';

import { TemplateFilesService } from './template-files/template-files.service';
import { TemplateTypesService } from './template-types/template-types.service';


const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  username: 'chufyrev',
  database: 'chufyrev',
  synchronize: true,
  entities: [TemplateFile, TemplateType]
};

const graphqlConfig: GqlModuleOptions = {
  formatError: (error: GraphQLError) => {
    const formattedError: GraphQLFormattedError = {
      message: error.message ||
               error.extensions?.exception?.message ||
               error.extensions?.exception?.response?.message ||
               'Unknown error'
    };
    return formattedError;
  },
  typePaths: ['./src/**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts')  // runtime-generated file
  }
};


@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig),
            GraphQLModule.forRoot(graphqlConfig),
            TemplateFilesModule,
            TemplateTypesModule],
  controllers: [AppController],
  providers: [AppService,
              TemplateTypesService,
              TemplateFilesService],
  exports: [AppService,
            TypeOrmModule,
            TemplateTypesService,
            TemplateFilesService]
})
export class AppModule {}
