import { CreateTemplateFileInput } from './create-template-file.input';
import { PartialType } from '@nestjs/graphql';

export class UpdateTemplateFileInput extends PartialType(CreateTemplateFileInput) {
  id: string;
}
