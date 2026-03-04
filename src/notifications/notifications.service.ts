import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly tokensRepository: Repository<DeviceToken>,
  ) {}

  async registerToken(userId: string, dto: RegisterDeviceTokenDto) {
    const existing = await this.tokensRepository.findOne({
      where: { device_token: dto.device_token },
    });
    if (existing) {
      existing.user_id = userId;
      existing.platform = dto.platform;
      return this.tokensRepository.save(existing);
    }

    const entity = this.tokensRepository.create({
      user_id: userId,
      device_token: dto.device_token,
      platform: dto.platform,
    });
    return this.tokensRepository.save(entity);
  }

  findMine(userId: string) {
    return this.tokensRepository.find({ where: { user_id: userId } });
  }
}
