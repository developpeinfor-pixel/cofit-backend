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
  @Matches(
    /^(data:image\/(?:jpe?g|png);base64,[A-Za-z0-9+/=]+|.*\.(jpe?g|png)(\?.*)?)$/i,
    {
      message: 'banner_url must be a jpg/jpeg/png url or a base64 data image',
    },
  )
  banner_url?: string;
}
