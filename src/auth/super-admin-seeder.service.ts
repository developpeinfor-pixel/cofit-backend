import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class SuperAdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminSeederService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const password = this.configService.get<string>('SUPER_ADMIN_PASSWORD');
    const firstName = this.configService.get<string>('SUPER_ADMIN_FIRST_NAME') ?? 'Super';
    const lastName = this.configService.get<string>('SUPER_ADMIN_LAST_NAME') ?? 'Admin';
    const phone = this.configService.get<string>('SUPER_ADMIN_PHONE') ?? '+10000000000';

    if (!email || !password) {
      this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing, skipping bootstrap');
      return;
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      // Keep this account as the canonical admin generale account on each boot.
      const needsPasswordUpdate = !(await bcrypt.compare(password, existing.password_hash));
      const needsProfileUpdate =
        existing.first_name !== firstName ||
        existing.last_name !== lastName ||
        existing.phone !== phone ||
        existing.role !== Role.ADMIN_GENERAL;

      if (needsPasswordUpdate || needsProfileUpdate) {
        existing.first_name = firstName;
        existing.last_name = lastName;
        existing.phone = phone;
        existing.role = Role.ADMIN_GENERAL;
        if (needsPasswordUpdate) {
          existing.password_hash = await bcrypt.hash(password, 10);
        }
        await this.usersService.saveUser(existing);
      }
      return;
    }

    await this.usersService.createWithRole(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      },
      Role.ADMIN_GENERAL,
    );

    this.logger.log(`Admin generale created: ${email}`);
  }
}
