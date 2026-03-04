import { Controller, Get, Param } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Public()
  @Get(':competitionId')
  findByCompetition(@Param('competitionId') competitionId: string) {
    return this.standingsService.findByCompetition(competitionId);
  }
}
