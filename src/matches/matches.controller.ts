import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Public()
  @Get()
  findAll(@Query('date') date?: string) {
    if (date) {
      return this.matchesService.findByDate(date);
    }
    return this.matchesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }
}
