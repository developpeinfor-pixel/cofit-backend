import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupTeam } from './entities/group-team.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupTeam)
    private readonly groupTeamsRepository: Repository<GroupTeam>,
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
  ) {}

  private sortAndRankEntries(entries: GroupTeam[]) {
    const sorted = [...entries].sort((a, b) => {
      const dbA = (a.goals_for ?? 0) - (a.goals_against ?? 0);
      const dbB = (b.goals_for ?? 0) - (b.goals_against ?? 0);
      if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0);
      if (dbB !== dbA) return dbB - dbA;
      if ((b.goals_for ?? 0) !== (a.goals_for ?? 0)) return (b.goals_for ?? 0) - (a.goals_for ?? 0);
      return (a.team?.name ?? '').localeCompare(b.team?.name ?? '');
    });

    return sorted.map((entry, idx) => ({
      id: entry.id,
      rank: idx + 1,
      mj: entry.played ?? 0,
      g: entry.won ?? 0,
      n: entry.draw ?? 0,
      p: entry.lost ?? 0,
      bm: entry.goals_for ?? 0,
      be: entry.goals_against ?? 0,
      db: (entry.goals_for ?? 0) - (entry.goals_against ?? 0),
      pts: entry.points ?? 0,
      team: entry.team
        ? {
            id: entry.team.id,
            name: entry.team.name,
            logo_url: entry.team.logo_url ?? null,
          }
        : null,
    }));
  }

  private async enrichGroup(group: Group) {
    const entries = await this.groupTeamsRepository.find({
      where: { group_id: group.id },
      relations: ['team'],
    });
    return {
      id: group.id,
      competition_id: group.competition_id,
      name: group.name,
      phase: group.phase,
      created_at: group.created_at,
      team_count: entries.length,
      teams: this.sortAndRankEntries(entries),
    };
  }

  async create(dto: CreateGroupDto) {
    if (!dto.team_ids || dto.team_ids.length === 0) {
      throw new BadRequestException('At least one team is required');
    }

    const uniqueTeamIds = Array.from(new Set(dto.team_ids));
    if (uniqueTeamIds.length !== dto.team_ids.length) {
      throw new BadRequestException('A team can only be selected once in a group');
    }
    if (dto.team_count !== uniqueTeamIds.length) {
      throw new BadRequestException('team_count must match selected teams count');
    }

    const teams = await this.teamsRepository.find({ where: { id: In(uniqueTeamIds) } });
    if (teams.length !== uniqueTeamIds.length) {
      throw new BadRequestException('One or more selected teams do not exist');
    }

    const group = this.groupsRepository.create({
      competition_id: dto.competition_id,
      name: dto.name,
      phase: dto.phase?.trim() || 'group_stage',
    });
    const savedGroup = await this.groupsRepository.save(group);

    const entries = uniqueTeamIds.map((teamId, idx) =>
      this.groupTeamsRepository.create({
        group_id: savedGroup.id,
        team_id: teamId,
        rank: idx + 1,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0,
      }),
    );
    await this.groupTeamsRepository.save(entries);
    return this.enrichGroup(savedGroup);
  }

  async findAll(competitionId?: string) {
    const baseWhere =
      competitionId && competitionId.trim().length > 0
        ? { competition_id: competitionId }
        : undefined;

    const groups = await this.groupsRepository.find({
      where: baseWhere,
      order: { name: 'ASC' },
    });

    const enriched: Array<Record<string, unknown>> = [];
    for (const group of groups) {
      enriched.push(await this.enrichGroup(group));
    }
    return enriched;
  }

  async findOne(id: string) {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(id: string, dto: UpdateGroupDto) {
    const group = await this.findOne(id);
    Object.assign(group, {
      competition_id: dto.competition_id ?? group.competition_id,
      name: dto.name ?? group.name,
      phase: dto.phase ?? group.phase,
    });
    const savedGroup = await this.groupsRepository.save(group);

    if (dto.team_count != null && dto.team_ids == null) {
      throw new BadRequestException('team_ids is required when team_count is provided');
    }

    if (dto.team_ids != null) {
      if (dto.team_ids.length === 0) {
        throw new BadRequestException('At least one team is required');
      }

      const uniqueTeamIds = Array.from(new Set(dto.team_ids));
      if (dto.team_count != null && dto.team_count !== uniqueTeamIds.length) {
        throw new BadRequestException('team_count must match selected teams count');
      }
      const teams = await this.teamsRepository.find({
        where: { id: In(uniqueTeamIds) },
      });
      if (teams.length !== uniqueTeamIds.length) {
        throw new BadRequestException('One or more selected teams do not exist');
      }

      await this.groupTeamsRepository.delete({ group_id: id });
      const entries = uniqueTeamIds.map((teamId, idx) =>
        this.groupTeamsRepository.create({
          group_id: id,
          team_id: teamId,
          rank: idx + 1,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0,
        }),
      );
      await this.groupTeamsRepository.save(entries);
    }

    return this.enrichGroup(savedGroup);
  }

  async remove(id: string) {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
    return { message: 'Group deleted' };
  }
}
