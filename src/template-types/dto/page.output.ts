import { PagedOutput } from 'src/common/graphql/types/dto';

import { FindOneDto } from './find-one.output';


export class PagedOutputDto implements PagedOutput<FindOneDto> {
  items: FindOneDto[];
  total: number;

  constructor(mapping: Required<PagedOutputDto>) {
    Object.assign(this, mapping);
  }
}
