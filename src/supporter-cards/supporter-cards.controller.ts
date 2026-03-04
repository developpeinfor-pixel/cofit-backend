import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SupporterCardsService } from './supporter-cards.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SubscribeSupporterCardDto } from './dto/subscribe-supporter-card.dto';

@UseGuards(JwtAuthGuard)
@Controller('app/supporter-cards')
export class SupporterCardsController {
  constructor(private readonly supporterCardsService: SupporterCardsService) {}

  @Post('subscribe')
  subscribe(
    @Req() req: { user: { userId: string } },
    @Body() dto: SubscribeSupporterCardDto,
  ) {
    return this.supporterCardsService.subscribe(req.user.userId, dto);
  }

  @Get('me')
  findMine(@Req() req: { user: { userId: string } }) {
    return this.supporterCardsService.findMine(req.user.userId);
  }
}
