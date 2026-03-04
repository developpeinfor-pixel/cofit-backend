import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
  ) {}

  create(dto: CreateTeamDto) {
    const team = this.teamsRepository.create(dto);
    return this.teamsRepository.save(team);
  }

  findAll() {
    return this.teamsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    const team = await this.findOne(id);
    Object.assign(team, dto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
    return { message: 'Team deleted' };
  }
}
