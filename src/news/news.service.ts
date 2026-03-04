import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  create(dto: CreateNewsDto) {
    const entity = this.newsRepository.create({
      ...dto,
      published_at: dto.is_published ? new Date() : undefined,
    });
    return this.newsRepository.save(entity);
  }

  findPublished() {
    return this.newsRepository.find({
      where: { is_published: true },
      order: { published_at: 'DESC', created_at: 'DESC' },
    });
  }

  findAllAdmin() {
    return this.newsRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const item = await this.newsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('News not found');
    }
    return item;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.findOne(id);
    const shouldSetPublishedAt =
      dto.is_published !== undefined &&
      dto.is_published &&
      !existing.published_at;

    Object.assign(existing, dto);
    if (shouldSetPublishedAt) {
      existing.published_at = new Date();
    }

    return this.newsRepository.save(existing);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.newsRepository.remove(item);
    return { message: 'News deleted' };
  }
}
