import { CreateTemplateTypeInput } from './create.input';
import { PartialType } from '@nestjs/graphql';

export class UpdateTemplateTypeInput extends PartialType(CreateTemplateTypeInput) {
  id: string;
}
