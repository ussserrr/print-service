import { Test, TestingModule } from '@nestjs/testing';
import { PrintController } from './controller';
import { PrintService } from './service';

describe('PrintController', () => {
  let controller: PrintController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintController],
      providers: [PrintService],
    }).compile();

    controller = module.get<PrintController>(PrintController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
