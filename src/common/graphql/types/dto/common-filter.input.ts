import * as gqlSchema from 'src/graphql';

import { ArrayNotEmpty } from 'class-validator';


export class CommonFilterDto extends gqlSchema.CommonFilter {
  @ArrayNotEmpty()
  ids: string[];

  // search: string;
}
