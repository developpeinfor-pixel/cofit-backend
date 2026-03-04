import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register/user')
  registerUser(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('register/admin')
  registerAdmin(@Body() body: RegisterDto) {
    return this.authService.registerAdmin(body);
  }
}
