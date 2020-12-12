import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFilesResolver } from './resolver';
import { TemplateFilesService } from './service';

describe('TemplateFilesResolver', () => {
  let resolver: TemplateFilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateFilesResolver, TemplateFilesService],
    }).compile();

    resolver = module.get<TemplateFilesResolver>(TemplateFilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
