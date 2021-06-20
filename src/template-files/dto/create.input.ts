import { IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import * as gqlSchema from 'src/graphql';


export class CreateDto implements gqlSchema.CreateTemplateFileInput {
  @IsUUID()
  templateTypeId: string;

  @IsNotEmpty()
  @Transform(value => value.trim())
  title?: string;

  isCurrentFileOfItsType?: boolean;
}
