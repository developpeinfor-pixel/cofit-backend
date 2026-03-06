import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupTeam } from './group-team.entity';

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

  @OneToMany(() => GroupTeam, (entry) => entry.group, { cascade: ['insert', 'update'] })
  entries?: GroupTeam[];
}
