import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  competition_id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phase?: string;
}
