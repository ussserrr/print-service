import { Test, TestingModule } from '@nestjs/testing';
import { TemplateTypesResolver } from './template-types.resolver';
import { TemplateTypesService } from './template-types.service';

describe('TemplateTypesResolver', () => {
  let resolver: TemplateTypesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateTypesResolver, TemplateTypesService],
    }).compile();

    resolver = module.get<TemplateTypesResolver>(TemplateTypesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
