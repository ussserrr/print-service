import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TemplateFile } from './entities/template-file.entity';

import { CreateTemplateFileInput } from './dto/create-template-file.input';
import { UpdateTemplateFileInput } from './dto/update-template-file.input';


@Injectable()
export class TemplateFilesService {
  constructor(
    @InjectRepository(TemplateFile)
    private filesRepository: Repository<TemplateFile>
  ) {}

  create(createTemplateFileInput: CreateTemplateFileInput) {
    return 'This action adds a new templateFile';
  }

  findAll(): Promise<TemplateFile[]> {
    return this.filesRepository.find();
  }

  findOne(id: number): Promise<TemplateFile> {
    return this.filesRepository.findOne(id);
  }

  update(id: number, updateTemplateFileInput: UpdateTemplateFileInput) {
    return `This action updates a #${id} templateFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} templateFile`;
  }
}
