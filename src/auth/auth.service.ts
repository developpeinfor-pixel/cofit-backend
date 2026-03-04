import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async register(dto: RegisterDto) {
    return this.usersService.createWithRole(dto, Role.USER);
  }

  async registerAdmin(dto: RegisterDto) {
    throw new ForbiddenException(
      'Direct admin registration is disabled. Ask an admin generale to create your account.',
    );
  }

  async createAccountByPrivilegedUser(
    actor: { userId: string; role: Role },
    dto: CreateManagedUserDto,
  ) {
    if (actor.role !== Role.ADMIN_GENERAL) {
      throw new ForbiddenException('Only admin generale can create accounts');
    }

    return this.usersService.createWithRole(dto, dto.role);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const isAdminSession = [
      Role.ADMIN_GENERAL,
      Role.ADMIN_SENIOR,
      Role.ADMIN_JUNIOR,
    ].includes(user.role as Role);
    const expiresIn = isAdminSession
      ? (this.configService.get<string>('ADMIN_JWT_EXPIRES_IN') ?? '8h')
      : (this.configService.get<string>('JWT_EXPIRES_IN') ?? '30d');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      // jsonwebtoken typings are strict on expiresIn literal unions
      access_token: await this.jwtService.signAsync(payload, { expiresIn: expiresIn as any }),
      user: this.usersService.sanitize(user),
    };
  }
}
