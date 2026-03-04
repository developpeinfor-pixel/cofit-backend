import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';

export class SubscribeSupporterCardDto {
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @IsOptional()
  external_reference?: string;
}
