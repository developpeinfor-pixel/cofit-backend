import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
  ) {}

  create(dto: CreateVideoDto) {
    const entity = this.videosRepository.create({
      ...dto,
      published_at: dto.is_published ? new Date() : undefined,
    });
    return this.videosRepository.save(entity);
  }

  findPublished() {
    return this.videosRepository.find({
      where: { is_published: true },
      order: { published_at: 'DESC', created_at: 'DESC' },
    });
  }

  findAllAdmin() {
    return this.videosRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const video = await this.videosRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async update(id: string, dto: UpdateVideoDto) {
    const video = await this.findOne(id);
    const shouldSetPublishedAt =
      dto.is_published !== undefined && dto.is_published && !video.published_at;
    Object.assign(video, dto);
    if (shouldSetPublishedAt) {
      video.published_at = new Date();
    }
    return this.videosRepository.save(video);
  }

  async remove(id: string) {
    const video = await this.findOne(id);
    await this.videosRepository.remove(video);
    return { message: 'Video deleted' };
  }
}
