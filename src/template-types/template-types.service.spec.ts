import { Test, TestingModule } from '@nestjs/testing';
import { TemplateTypesService } from './template-types.service';

describe('TemplateTypesService', () => {
  let service: TemplateTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateTypesService],
    }).compile();

    service = module.get<TemplateTypesService>(TemplateTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
