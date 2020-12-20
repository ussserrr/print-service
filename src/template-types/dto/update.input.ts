import { IsNotEmpty, IsUUID } from 'class-validator';

import * as gqlSchema from 'src/graphql';

export class UpdateDto implements gqlSchema.UpdateTemplateTypeInput {
  @IsNotEmpty() title?: string;
  active?: boolean;
  @IsUUID() currentFileId?: string;
}
