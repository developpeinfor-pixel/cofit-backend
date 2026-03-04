import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Public()
  @Get()
  findPublished() {
    return this.videosService.findPublished();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }
}
