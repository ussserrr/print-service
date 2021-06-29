import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

import * as gqlSchema from 'src/graphql';


export class UpdateDto implements gqlSchema.UpdateTemplateFileInput {
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  title?: string;

  isCurrentFileOfItsType?: boolean;
}
