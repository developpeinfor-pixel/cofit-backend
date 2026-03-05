import { Controller, Get, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('app/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Query('competition_id') competitionId?: string) {
    return this.groupsService.findAll(competitionId);
  }
}
