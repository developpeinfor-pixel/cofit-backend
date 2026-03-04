import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminFootballEnhancements1762700000000 implements MigrationInterface {
  name = 'AdminFootballEnhancements1762700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        start_date date NULL,
        end_date date NULL,
        is_active boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE competitions
      ADD COLUMN IF NOT EXISTS location varchar,
      ADD COLUMN IF NOT EXISTS description varchar,
      ADD COLUMN IF NOT EXISTS banner_url varchar;
    `);

    await queryRunner.query(`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS short_name varchar,
      ADD COLUMN IF NOT EXISTS club_colors varchar,
      ADD COLUMN IF NOT EXISTS players jsonb,
      ADD COLUMN IF NOT EXISTS staff jsonb;
    `);

    await queryRunner.query(`
      ALTER TABLE matches
      ADD COLUMN IF NOT EXISTS round varchar,
      ADD COLUMN IF NOT EXISTS referees jsonb,
      ADD COLUMN IF NOT EXISTS lineup_home jsonb,
      ADD COLUMN IF NOT EXISTS lineup_away jsonb,
      ADD COLUMN IF NOT EXISTS match_stats jsonb,
      ADD COLUMN IF NOT EXISTS man_of_the_match jsonb,
      ADD COLUMN IF NOT EXISTS incidents jsonb;
    `);

    await queryRunner.query(`
      ALTER TABLE videos
      ADD COLUMN IF NOT EXISTS video_size_mb integer;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'video_type_enum'
            AND e.enumlabel = 'interview'
        ) THEN
          -- enum value already present
        ELSE
          ALTER TYPE video_type_enum ADD VALUE 'interview';
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE videos
      DROP COLUMN IF EXISTS video_size_mb;
    `);

    await queryRunner.query(`
      ALTER TABLE matches
      DROP COLUMN IF EXISTS incidents,
      DROP COLUMN IF EXISTS man_of_the_match,
      DROP COLUMN IF EXISTS match_stats,
      DROP COLUMN IF EXISTS lineup_away,
      DROP COLUMN IF EXISTS lineup_home,
      DROP COLUMN IF EXISTS referees,
      DROP COLUMN IF EXISTS round;
    `);

    await queryRunner.query(`
      ALTER TABLE teams
      DROP COLUMN IF EXISTS staff,
      DROP COLUMN IF EXISTS players,
      DROP COLUMN IF EXISTS club_colors,
      DROP COLUMN IF EXISTS short_name;
    `);

    await queryRunner.query(`
      ALTER TABLE competitions
      DROP COLUMN IF EXISTS banner_url,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS location;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS seasons;`);
  }
}
