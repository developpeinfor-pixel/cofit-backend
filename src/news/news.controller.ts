import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  findPublished() {
    return this.newsService.findPublished();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
