import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  qr_code: string;
}
