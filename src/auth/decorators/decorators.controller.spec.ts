import { Test, TestingModule } from '@nestjs/testing';
import { DecoratorsController } from './decorators.controller';

describe('DecoratorsController', () => {
  let controller: DecoratorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecoratorsController],
    }).compile();

    controller = module.get<DecoratorsController>(DecoratorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
