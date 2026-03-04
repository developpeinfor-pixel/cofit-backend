import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';

@UseGuards(JwtAuthGuard)
@Controller('app/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase')
  purchase(
    @Req() req: { user: { userId: string } },
    @Body() dto: PurchaseTicketDto,
  ) {
    return this.ticketsService.purchase(req.user.userId, dto);
  }

  @Get('me')
  findMine(@Req() req: { user: { userId: string } }) {
    return this.ticketsService.findMine(req.user.userId);
  }

  @Get('me/day/:date/matches')
  getDayMatches(@Req() req: { user: { userId: string } }, @Param('date') date: string) {
    return this.ticketsService.getDayAccessMatches(req.user.userId, date);
  }
}
