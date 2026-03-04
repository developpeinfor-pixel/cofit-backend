import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DevicePlatform } from '../../common/enums/device-platform.enum';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  device_token: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;
}
