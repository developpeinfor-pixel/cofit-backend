import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @Matches(/\.(jpe?g|png)(\?.*)?$/i, {
    message: 'image_url must end with .jpg, .jpeg or .png',
  })
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
