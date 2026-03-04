import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  season: string;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/\.(jpe?g|png)(\?.*)?$/i, {
    message: 'banner_url must end with .jpg, .jpeg or .png',
  })
  banner_url?: string;
}
