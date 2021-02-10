import { join } from 'path';

import { GraphQLDefinitionsFactory } from '@nestjs/graphql';


const definitionsFactory = new GraphQLDefinitionsFactory();

/**
 * WARNING: make sure this config is matching the one from the main code (where the
 * GraphQL module instantiated) otherwise you can meet some unexpected behavior
 */
definitionsFactory.generate({
  watch: true,
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src', 'graphql.ts'),
  defaultScalarType: 'unknown',
  customScalarTypeMapping: {
    'Upload': 'FileUpload'
  },
  additionalHeader: 'import { FileUpload } from "graphql-upload";'
});
