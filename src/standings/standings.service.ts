import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Standing } from './entities/standing.entity';
import { UpsertStandingDto } from './dto/upsert-standing.dto';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Standing)
    private readonly standingsRepository: Repository<Standing>,
  ) {}

  findByCompetition(competitionId: string) {
    return this.standingsRepository.find({
      where: { competition_id: competitionId },
      order: { points: 'DESC', goals_for: 'DESC' },
    });
  }

  async upsert(dto: UpsertStandingDto) {
    const existing = await this.standingsRepository.findOne({
      where: {
        competition_id: dto.competition_id,
        team_id: dto.team_id,
      },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.standingsRepository.save(existing);
    }

    const standing = this.standingsRepository.create(dto);
    return this.standingsRepository.save(standing);
  }
}
