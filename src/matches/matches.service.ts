import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchStatus } from '../common/enums/match-status.enum';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
  ) {}

  create(dto: CreateMatchDto) {
    const match = this.matchesRepository.create({
      ...dto,
      status: dto.status ?? MatchStatus.UPCOMING,
    });
    return this.matchesRepository.save(match);
  }

  findAll() {
    return this.matchesRepository.find({
      order: { match_date: 'ASC', kickoff_time: 'ASC' },
    });
  }

  findByDate(matchDate: string) {
    return this.matchesRepository.find({
      where: { match_date: matchDate },
      order: { kickoff_time: 'ASC' },
    });
  }

  async findOne(id: string) {
    const match = await this.matchesRepository.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    return match;
  }

  async update(id: string, dto: UpdateMatchDto) {
    const match = await this.findOne(id);
    Object.assign(match, dto);
    return this.matchesRepository.save(match);
  }

  async remove(id: string) {
    const match = await this.findOne(id);
    await this.matchesRepository.remove(match);
    return { message: 'Match deleted' };
  }

  async getHomeData() {
    const [upcomingMatch, recentResults] = await Promise.all([
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
    ]);

    return {
      featured_match: upcomingMatch[0] ?? null,
      recent_results: recentResults,
    };
  }
}
