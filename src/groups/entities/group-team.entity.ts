import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Group } from './group.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('group_teams')
@Unique(['group_id', 'team_id'])
export class GroupTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  group_id: string;

  @Column()
  team_id: string;

  @Column({ default: 0 })
  rank: number;

  @Column({ default: 0 })
  played: number;

  @Column({ default: 0 })
  won: number;

  @Column({ default: 0 })
  draw: number;

  @Column({ default: 0 })
  lost: number;

  @Column({ default: 0 })
  goals_for: number;

  @Column({ default: 0 })
  goals_against: number;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Group, (group) => group.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Team, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
