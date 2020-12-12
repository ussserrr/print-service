import * as gqlSchema from 'src/graphql';

import { ArrayNotEmpty, IsDate, IsNotEmpty, IsPositive, IsUUID, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export const Operators = {
  [gqlSchema.Operator.LT]: '<',
  [gqlSchema.Operator.LE]: '<=',
  [gqlSchema.Operator.GT]: '>',
  [gqlSchema.Operator.GE]: '>='
} as const;


export class CommonFilterDto implements gqlSchema.CommonFilter {
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids?: string[];

  @MinLength(3) search?: string;

  constructor(mapping?: Pick<CommonFilterDto, keyof CommonFilterDto>) {
    Object.assign(this, mapping);
  }
}


export class DateFilterDto implements gqlSchema.DateFilter {
  operator: gqlSchema.Operator;

  @IsDate()
  @Type(() => Date)
  value: Date;

  constructor(mapping: Pick<DateFilterDto, keyof DateFilterDto>) {
    Object.assign(this, mapping);
  }
}


export class SortByDto implements gqlSchema.SortBy {
  @IsNotEmpty() field: string;
  order: gqlSchema.SortOrder;

  constructor(mapping: Pick<SortByDto, keyof SortByDto>) {
    Object.assign(this, mapping);
  }
}


export class PageInputDto implements gqlSchema.PageInput {
  @IsPositive() limit? = 10;
  @Min(0) offset? = 0;

  @ValidateNested()
  @Type(() => SortByDto)
  sortBy?: SortByDto;

  constructor(mapping?: Pick<PageInputDto, keyof PageInputDto>) {
    if (mapping?.sortBy && !(mapping.sortBy instanceof SortByDto)) {
      this.sortBy = new SortByDto(mapping.sortBy);
      delete mapping.sortBy;
    }
    Object.assign(this, mapping);
  }
}


// This can be a generic in TS but not in GraphQL... Though, if we use class-transformer it shouldn't be a generic either
export interface PagedOutput<T> {
  items: T[];
  total: number;
}
