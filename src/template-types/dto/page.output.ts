import { Expose, Type } from 'class-transformer';

import { PagedOutput } from 'src/common/graphql/types/dto';

import { FindOneDto } from './find-one.output';


export class PagedOutputDto implements PagedOutput<FindOneDto> {
  @Expose()
  @Type(() => FindOneDto)
  items: FindOneDto[];

  @Expose() total: number;

  constructor(mapping: Required<PagedOutputDto>) {
    Object.assign(this, mapping);
  }
}
