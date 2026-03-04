import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/match.entity';
import { MatchStatus } from '../common/enums/match-status.enum';
import { News } from '../news/entities/news.entity';
import { Video } from '../videos/entities/video.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
  ) {}

  async getHome() {
    const [featured, recentResults, latestNews, latestVideos] = await Promise.all([
      this.matchesRepository.find({
        where: { status: MatchStatus.UPCOMING },
        order: { match_date: 'ASC', kickoff_time: 'ASC' },
        take: 1,
      }),
      this.matchesRepository.find({
        where: { status: MatchStatus.FINISHED },
        order: { match_date: 'DESC', kickoff_time: 'DESC' },
        take: 5,
      }),
      this.newsRepository.find({
        where: { is_published: true },
        order: { published_at: 'DESC', created_at: 'DESC' },
        take: 5,
      }),
      this.videosRepository.find({
        where: { is_published: true },
        order: { published_at: 'DESC', created_at: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      featured_match: featured[0] ?? null,
      recent_results: recentResults,
      latest_news: latestNews,
      latest_videos: latestVideos,
      supporter_card_promo: {
        title: 'Carte Supporters',
        description: 'Acces illimite aux matchs pendant la periode de validite',
      },
    };
  }
}
