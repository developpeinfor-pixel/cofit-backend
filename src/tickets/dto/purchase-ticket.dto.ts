import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';

export class PurchaseTicketDto {
  @IsString()
  @IsOptional()
  ticket_date?: string;

  @IsString()
  @IsOptional()
  match_id?: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @IsOptional()
  external_reference?: string;
}
