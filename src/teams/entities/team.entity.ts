import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ nullable: true })
  short_name?: string;

  @Column({ nullable: true })
  club_colors?: string;

  @OneToMany(() => Player, (player) => player.team, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  players?: Player[];

  @Column({ type: 'jsonb', nullable: true })
  staff?: Array<Record<string, unknown>>;

  @CreateDateColumn()
  created_at: Date;
}
