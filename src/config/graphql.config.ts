import * as path from 'path';

import { GqlModuleOptions } from '@nestjs/graphql';
import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';
import { ContextFunction } from 'apollo-server-core';
import GraphQLJSON from 'graphql-type-json';

import { TemplateFile } from 'src/template-files/entities/entity';


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
  useGlobalPrefix: true,
  cors: process.env.NODE_ENV === 'development',
  uploads: false,  // https://github.com/jaydenseric/graphql-upload/issues/170#issuecomment-825532027
  context: contextFactory,
  formatResponse: (
    response: GraphQLResponse | null,
    ctx: GraphQLRequestContext<AppGraphQLContext>,
  ): GraphQLResponse => {
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

  /**
   * For class-transformer type transformations
   * https://github.com/nestjs/graphql/issues/1565
   * https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
   */
  fieldResolverEnhancers: ['interceptors'],

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

export default graphqlConfig;
