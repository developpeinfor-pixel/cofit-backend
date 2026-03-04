import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('app/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me')
  findMine(@Req() req: { user: { userId: string } }) {
    return this.paymentsService.findByUser(req.user.userId);
  }
}
