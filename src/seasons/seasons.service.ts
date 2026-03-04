import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './entities/season.entity';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonsRepository: Repository<Season>,
  ) {}

  async create(dto: CreateSeasonDto) {
    const season = this.seasonsRepository.create({
      ...dto,
      is_active: dto.is_active ?? false,
    });
    if (season.is_active) {
      await this.seasonsRepository.update({}, { is_active: false });
    }
    return this.seasonsRepository.save(season);
  }

  findAll() {
    return this.seasonsRepository.find({
      order: { is_active: 'DESC', start_date: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const season = await this.seasonsRepository.findOne({ where: { id } });
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    return season;
  }

  async update(id: string, dto: UpdateSeasonDto) {
    const season = await this.findOne(id);
    if (dto.is_active) {
      await this.seasonsRepository.update({}, { is_active: false });
    }
    Object.assign(season, dto);
    return this.seasonsRepository.save(season);
  }

  async remove(id: string) {
    const season = await this.findOne(id);
    await this.seasonsRepository.remove(season);
    return { message: 'Season deleted' };
  }
}
