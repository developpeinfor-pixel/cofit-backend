import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';

@UseGuards(JwtAuthGuard)
@Controller('app/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('device-token')
  registerDeviceToken(
    @Req() req: { user: { userId: string } },
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.notificationsService.registerToken(req.user.userId, dto);
  }

  @Get('device-token/me')
  findMine(@Req() req: { user: { userId: string } }) {
    return this.notificationsService.findMine(req.user.userId);
  }
}
