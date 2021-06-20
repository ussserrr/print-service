import { IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import * as gqlSchema from 'src/graphql';


export class UpdateDto implements gqlSchema.UpdateTemplateTypeInput {
  @IsNotEmpty()
  @Transform(value => value.trim())
  title?: string;

  active?: boolean;

  @IsUUID('all', { message: `currentFileId must be an UUID or null` })
  currentFileId?: string;
}
