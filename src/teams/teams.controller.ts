import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Public()
  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }
}
