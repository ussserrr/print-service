import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFilesService } from './service';

describe('TemplateFilesService', () => {
  let service: TemplateFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateFilesService],
    }).compile();

    service = module.get<TemplateFilesService>(TemplateFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
