import { PagedOutput } from 'src/common/types/dto';

import { FindOneDto } from './find-one.output';


export class PagedOutputDto implements PagedOutput<FindOneDto> {
  items!: FindOneDto[];
  total!: number;

  constructor(map: Required<PagedOutputDto>) {
    Object.assign(this, map);
  }
}
