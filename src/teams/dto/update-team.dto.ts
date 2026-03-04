import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/\.(jpe?g|png)(\?.*)?$/i, {
    message: 'logo_url must end with .jpg, .jpeg or .png',
  })
  logo_url?: string;

  @IsString()
  @IsOptional()
  short_name?: string;

  @IsString()
  @IsOptional()
  club_colors?: string;

  @IsArray()
  @IsOptional()
  players?: Array<Record<string, unknown>>;

  @IsArray()
  @IsOptional()
  staff?: Array<Record<string, unknown>>;
}
