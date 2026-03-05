import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(data:image\/(?:jpe?g|png);base64,[A-Za-z0-9+/=]+|.*\.(jpe?g|png)(\?.*)?)$/i,
    {
      message: 'logo_url must be a jpg/jpeg/png url or a base64 data image',
    },
  )
  logo_url?: string;

  @IsString()
  @IsOptional()
  short_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\s*[^,;]+(\s*[,;]\s*[^,;]+)+\s*$/, {
    message: 'club_colors must contain at least two colors separated by comma or semicolon',
  })
  club_colors?: string;

  @IsArray()
  @IsOptional()
  players?: Array<Record<string, unknown>>;

  @IsArray()
  @IsOptional()
  staff?: Array<Record<string, unknown>>;
}
