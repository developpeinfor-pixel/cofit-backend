import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_GENERAL)
@Controller('admin/tickets')
export class AdminTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAllAdmin();
  }

  @Post('validate/:qrCode')
  validateQr(@Param('qrCode') qrCode: string) {
    return this.ticketsService.validateQr(qrCode);
  }

  @Post('validate')
  validateQrFromBody(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.validateQr(dto.qr_code);
  }
}
