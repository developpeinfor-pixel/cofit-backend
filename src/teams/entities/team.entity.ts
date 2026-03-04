import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'jsonb', nullable: true })
  players?: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', nullable: true })
  staff?: Array<Record<string, unknown>>;

  @CreateDateColumn()
  created_at: Date;
}
