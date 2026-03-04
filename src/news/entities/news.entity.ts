import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ default: true })
  is_published: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at?: Date;

  @CreateDateColumn()
  created_at: Date;
}
