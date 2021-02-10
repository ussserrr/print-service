import { IsUUID } from 'class-validator';

export class RequestDto {
  @IsUUID() token: string;  // TODO: required, also check validation
}
