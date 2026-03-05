import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { Player } from './entities/player.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  private normalizePlayer(input: Record<string, unknown>) {
    const nom = String(input.nom ?? '').trim();
    const prenoms = String(input.prenoms ?? input.prenom ?? '').trim();
    const surnom = String(input.surnom ?? '').trim();
    const dossard = String(input.dossard ?? input.dossart ?? input.dorsal ?? '').trim();
    return {
      nom,
      prenoms,
      surnom: surnom.length ? surnom : undefined,
      dossard: dossard.length ? dossard : undefined,
    };
  }

  private normalizePlayers(players?: Array<Record<string, unknown>>) {
    return (players ?? [])
      .map((p) => this.normalizePlayer(p))
      .filter((p) => p.nom.length > 0 || p.prenoms.length > 0 || (p.dossard ?? '').length > 0);
  }

  async create(dto: CreateTeamDto) {
    const { players, ...teamPayload } = dto;
    const team = this.teamsRepository.create(teamPayload);
    const savedTeam = await this.teamsRepository.save(team);

    const normalized = this.normalizePlayers(players);
    if (normalized.length > 0) {
      const entities = normalized.map((p) =>
        this.playersRepository.create({
          team: { id: savedTeam.id } as Team,
          ...p,
        }),
      );
      await this.playersRepository.save(entities);
    }

    return this.findOne(savedTeam.id);
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
    const { players, ...teamPayload } = dto;
    const team = await this.findOne(id);
    Object.assign(team, teamPayload);
    await this.teamsRepository.save(team);

    if (players) {
      await this.playersRepository.delete({ team_id: id });
      const normalized = this.normalizePlayers(players);
      if (normalized.length > 0) {
        const entities = normalized.map((p) =>
          this.playersRepository.create({
            team: { id } as Team,
            ...p,
          }),
        );
        await this.playersRepository.save(entities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
    return { message: 'Team deleted' };
  }
}
