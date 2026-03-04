import { Controller, Get } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Public()
  @Get()
  findAll() {
    return this.seasonsService.findAll();
  }
}
