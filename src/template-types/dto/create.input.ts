import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import * as gqlSchema from 'src/graphql';

import { Owner as dbOwner } from '../entities/entity';


export class CreateDto implements gqlSchema.CreateTemplateTypeInput {
  @Transform(({ value }: { value: gqlSchema.Owner }) => dbOwner[value])
  owner: dbOwner;

  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  title: string;
}
