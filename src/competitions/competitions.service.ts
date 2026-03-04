import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitionsRepository: Repository<Competition>,
  ) {}

  create(dto: CreateCompetitionDto) {
    const competition = this.competitionsRepository.create(dto);
    return this.competitionsRepository.save(competition);
  }

  findAll() {
    return this.competitionsRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const competition = await this.competitionsRepository.findOne({ where: { id } });
    if (!competition) {
      throw new NotFoundException('Competition not found');
    }
    return competition;
  }

  async update(id: string, dto: UpdateCompetitionDto) {
    const competition = await this.findOne(id);
    Object.assign(competition, dto);
    return this.competitionsRepository.save(competition);
  }

  async remove(id: string) {
    const competition = await this.findOne(id);
    await this.competitionsRepository.remove(competition);
    return { message: 'Competition deleted' };
  }
}
