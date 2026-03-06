module.exports = class AddGroupTeamsTable1762840000000 {
  name = 'AddGroupTeamsTable1762840000000';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS group_teams (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id uuid NOT NULL,
        team_id uuid NOT NULL,
        rank integer NOT NULL DEFAULT 0,
        played integer NOT NULL DEFAULT 0,
        won integer NOT NULL DEFAULT 0,
        draw integer NOT NULL DEFAULT 0,
        lost integer NOT NULL DEFAULT 0,
        goals_for integer NOT NULL DEFAULT 0,
        goals_against integer NOT NULL DEFAULT 0,
        points integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_group_teams_group'
        ) THEN
          ALTER TABLE group_teams
          ADD CONSTRAINT fk_group_teams_group
          FOREIGN KEY (group_id) REFERENCES groups(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_group_teams_team'
        ) THEN
          ALTER TABLE group_teams
          ADD CONSTRAINT fk_group_teams_team
          FOREIGN KEY (team_id) REFERENCES teams(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_group_teams_group_team
      ON group_teams (group_id, team_id);
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_group_teams_group_team;`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_group_teams_team'
        ) THEN
          ALTER TABLE group_teams DROP CONSTRAINT fk_group_teams_team;
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_group_teams_group'
        ) THEN
          ALTER TABLE group_teams DROP CONSTRAINT fk_group_teams_group;
        END IF;
      END$$;
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS group_teams;`);
  }
};
