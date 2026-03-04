import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { RolesGuard } from './jwt/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_GENERAL)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-account')
  createAccountByAdmin(
    @Req() req: { user: { userId: string; role: Role } },
    @Body() dto: CreateManagedUserDto,
  ) {
    return this.authService.createAccountByPrivilegedUser(req.user, dto);
  }
}
