import { CreateTemplateTypeInput } from './create-template-type.input';
import { PartialType } from '@nestjs/graphql';

export class UpdateTemplateTypeInput extends PartialType(CreateTemplateTypeInput) {
  id: string;
}
