import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TemplateType } from './entities/template-type.entity';

import { CreateTemplateTypeInput } from './dto/create-template-type.input';
import { UpdateTemplateTypeInput } from './dto/update-template-type.input';


@Injectable()
export class TemplateTypesService {
  constructor(
    @InjectRepository(TemplateType)
    private typesRepository: Repository<TemplateType>
  ) {}

  create(createTemplateTypeInput: CreateTemplateTypeInput) {
    return 'This action adds a new templateType';
  }

  findAll(): Promise<TemplateType[]> {
    return this.typesRepository.find();
  }

  findOne(id: number): Promise<TemplateType> {
    return this.typesRepository.findOne(id);
  }

  update(id: number, updateTemplateTypeInput: UpdateTemplateTypeInput) {
    return `This action updates a #${id} templateType`;
  }

  remove(id: number) {
    return `This action removes a #${id} templateType`;
  }
}
