import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { VideoType } from '../../common/enums/video-type.enum';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\.mp4(\?.*)?$/i, {
    message: 'video_url must end with .mp4',
  })
  video_url: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  video_size_mb?: number;

  @IsEnum(VideoType)
  type: VideoType;

  @IsString()
  @IsOptional()
  match_id?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
