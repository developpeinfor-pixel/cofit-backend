module.exports = class AddGroupsTable1762830000000 {
  name = 'AddGroupsTable1762830000000';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        competition_id uuid NOT NULL,
        name varchar NOT NULL,
        phase varchar NOT NULL DEFAULT 'group_stage',
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_groups_competition'
        ) THEN
          ALTER TABLE groups
          ADD CONSTRAINT fk_groups_competition
          FOREIGN KEY (competition_id) REFERENCES competitions(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_groups_competition_name
      ON groups (competition_id, name);
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_groups_competition_name;`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_groups_competition'
        ) THEN
          ALTER TABLE groups DROP CONSTRAINT fk_groups_competition;
        END IF;
      END$$;
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS groups;`);
  }
};
