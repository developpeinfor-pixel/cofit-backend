import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

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
