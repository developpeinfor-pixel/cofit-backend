import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Public()
  @Get()
  findAll() {
    return this.competitionsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }
}
