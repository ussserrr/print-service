import { IsNotEmpty, IsUUID } from 'class-validator';

import * as gqlSchema from 'src/graphql';

export class CreateDto implements gqlSchema.CreateTemplateFileInput {
  @IsUUID() templateTypeId: string;
  @IsNotEmpty() title?: string;
  makeCurrentFileOfItsType?: boolean;
}
