import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VideoType } from '../../common/enums/video-type.enum';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  video_size_mb?: number;

  @Column({
    type: 'enum',
    enum: VideoType,
    default: VideoType.SUMMARY,
  })
  type: VideoType;

  @Column({ nullable: true })
  match_id?: string;

  @Column({ default: true })
  is_published: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at?: Date;

  @CreateDateColumn()
  created_at: Date;
}
