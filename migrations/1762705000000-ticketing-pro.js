module.exports = class TicketingPro1762705000000 {
  name = 'TicketingPro1762705000000';

  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS match_id uuid,
      ADD COLUMN IF NOT EXISTS ticket_number varchar;
    `);

    await queryRunner.query(`
      UPDATE tickets
      SET ticket_number = CONCAT('LEGACY-', id::text)
      WHERE ticket_number IS NULL OR ticket_number = '';
    `);

    await queryRunner.query(`
      ALTER TABLE tickets
      ALTER COLUMN ticket_number SET NOT NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_ticket_number
      ON tickets (ticket_number);
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_tickets_match'
        ) THEN
          ALTER TABLE tickets
          ADD CONSTRAINT fk_tickets_match
          FOREIGN KEY (match_id) REFERENCES matches(id)
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS ux_tickets_user_date;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_user_match
      ON tickets (user_id, match_id)
      WHERE match_id IS NOT NULL;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_tickets_user_match;`);
    await queryRunner.query(`DROP INDEX IF EXISTS ux_tickets_ticket_number;`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_tickets_match'
        ) THEN
          ALTER TABLE tickets DROP CONSTRAINT fk_tickets_match;
        END IF;
      END$$;
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS ux_tickets_user_date;`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_user_date
      ON tickets (user_id, ticket_date);
    `);
    await queryRunner.query(`
      ALTER TABLE tickets
      DROP COLUMN IF EXISTS ticket_number,
      DROP COLUMN IF EXISTS match_id;
    `);
  }
};
