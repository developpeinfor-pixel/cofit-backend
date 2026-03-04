import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UpsertStandingDto } from './dto/upsert-standing.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_GENERAL, Role.ADMIN_SENIOR)
@Controller('admin/standings')
export class AdminStandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Post()
  upsert(@Body() dto: UpsertStandingDto) {
    return this.standingsService.upsert(dto);
  }
}
