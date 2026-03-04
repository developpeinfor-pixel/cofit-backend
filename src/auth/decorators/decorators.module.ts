import { Module } from '@nestjs/common';
import { DecoratorsService } from './decorators.service';
import { DecoratorsController } from './decorators.controller';

@Module({
  providers: [DecoratorsService],
  controllers: [DecoratorsController]
})
export class DecoratorsModule {}
