import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}

  create(dto: CreateGroupDto) {
    const group = this.groupsRepository.create({
      ...dto,
      phase: dto.phase?.trim() || 'group_stage',
    });
    return this.groupsRepository.save(group);
  }

  findAll(competitionId?: string) {
    if (competitionId && competitionId.trim().length > 0) {
      return this.groupsRepository.find({
        where: { competition_id: competitionId },
        order: { name: 'ASC' },
      });
    }
    return this.groupsRepository.find({ order: { created_at: 'DESC' } });
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
    Object.assign(group, dto);
    return this.groupsRepository.save(group);
  }

  async remove(id: string) {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
    return { message: 'Group deleted' };
  }
}
