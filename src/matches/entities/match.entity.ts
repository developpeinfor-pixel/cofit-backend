import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MatchStatus } from '../../common/enums/match-status.enum';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  competition_id?: string;

  @Column()
  home_team_id: string;

  @Column()
  away_team_id: string;

  @Column({ type: 'date' })
  match_date: string;

  @Column({ type: 'time' })
  kickoff_time: string;

  @Column()
  stadium: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ticket_price: string;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.UPCOMING,
  })
  status: MatchStatus;

  @Column({ default: 0 })
  home_score: number;

  @Column({ default: 0 })
  away_score: number;

  @Column({ nullable: true })
  round?: string;

  @Column({ type: 'jsonb', nullable: true })
  referees?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  lineup_home?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  lineup_away?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  match_stats?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  man_of_the_match?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  incidents?: Array<Record<string, unknown>>;

  @CreateDateColumn()
  created_at: Date;
}
