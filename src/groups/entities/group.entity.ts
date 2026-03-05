import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  competition_id: string;

  @Column()
  name: string;

  @Column({ default: 'group_stage' })
  phase: string;

  @CreateDateColumn()
  created_at: Date;
}
