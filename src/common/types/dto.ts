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

  constructor(map?: Pick<CommonFilterDto, keyof CommonFilterDto>) {
    Object.assign(this, map);
  }
}


export class DateFilterDto implements gqlSchema.DateFilter {
  operator!: gqlSchema.Operator;

  @IsDate()
  @Type(() => Date)
  value!: Date;

  constructor(map: Pick<DateFilterDto, keyof DateFilterDto>) {
    Object.assign(this, map);
  }
}


export class SortByDto implements gqlSchema.SortBy {
  @IsNotEmpty() field!: string;
  order!: gqlSchema.SortOrder;

  constructor(map: Pick<SortByDto, keyof SortByDto>) {
    Object.assign(this, map);
  }
}


export class PageInputDto implements gqlSchema.PageInput {
  @IsPositive() limit? = 10;
  @Min(0) offset? = 0;

  @ValidateNested()
  @Type(() => SortByDto)
  sortBy?: SortByDto;

  constructor(map?: Pick<PageInputDto, keyof PageInputDto>) {
    if (map?.sortBy && !(map.sortBy instanceof SortByDto)) {
      this.sortBy = new SortByDto(map.sortBy);
      delete map.sortBy;
    }
    Object.assign(this, map);
  }
}
