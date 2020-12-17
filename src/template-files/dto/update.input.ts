import { IsNotEmpty } from 'class-validator';

import * as gqlSchema from 'src/graphql';

export class UpdateDto implements gqlSchema.UpdateTemplateFileInput {
  @IsNotEmpty() title?: string;
  makeCurrentFileOfItsType?: boolean;
}
