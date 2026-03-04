import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('standings')
@Unique(['competition_id', 'team_id'])
export class Standing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  competition_id: string;

  @Column()
  team_id: string;

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
}
