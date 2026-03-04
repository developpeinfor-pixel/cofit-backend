import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../matches/entities/match.entity';
import { News } from '../news/entities/news.entity';
import { Video } from '../videos/entities/video.entity';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match, News, Video])],
  providers: [HomeService],
  controllers: [HomeController],
})
export class HomeModule {}
