module.exports = class PlayersTableAndTeamColors1762810000000 {
  name = 'PlayersTableAndTeamColors1762810000000';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS players (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id uuid NOT NULL,
        nom varchar NOT NULL DEFAULT '',
        prenoms varchar NOT NULL DEFAULT '',
        surnom varchar NULL,
        dossard varchar NULL
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_players_team'
        ) THEN
          ALTER TABLE players
          ADD CONSTRAINT fk_players_team
          FOREIGN KEY (team_id) REFERENCES teams(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      INSERT INTO players (team_id, nom, prenoms, surnom, dossard)
      SELECT
        t.id,
        COALESCE(p->>'nom', ''),
        COALESCE(p->>'prenoms', p->>'prenom', ''),
        NULLIF(COALESCE(p->>'surnom', ''), ''),
        NULLIF(COALESCE(p->>'dossard', p->>'dossart', p->>'dorsal', ''), '')
      FROM teams t
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(t.players, '[]'::jsonb)) p
      WHERE t.players IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE teams
      DROP COLUMN IF EXISTS players;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS players jsonb;
    `);

    await queryRunner.query(`
      UPDATE teams t
      SET players = src.players_json
      FROM (
        SELECT
          p.team_id,
          jsonb_agg(
            jsonb_build_object(
              'nom', p.nom,
              'prenoms', p.prenoms,
              'surnom', COALESCE(p.surnom, ''),
              'dossard', COALESCE(p.dossard, '')
            )
          ) AS players_json
        FROM players p
        GROUP BY p.team_id
      ) src
      WHERE t.id = src.team_id;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_players_team'
        ) THEN
          ALTER TABLE players DROP CONSTRAINT fk_players_team;
        END IF;
      END$$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS players;`);
  }
};
