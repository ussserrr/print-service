import { IsDefined, IsUUID } from 'class-validator';

export class RequestDto {
  @IsUUID()
  @IsDefined()
  token: string;
}
