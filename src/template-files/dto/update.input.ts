import { CreateTemplateFileInput } from './create.input';
import { PartialType } from '@nestjs/graphql';

export class UpdateTemplateFileInput extends PartialType(CreateTemplateFileInput) {
  id: string;
}
