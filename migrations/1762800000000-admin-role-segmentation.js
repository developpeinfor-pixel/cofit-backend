module.exports = class AdminRoleSegmentation1762800000000 {
  name = 'AdminRoleSegmentation1762800000000';

  async up(queryRunner) {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum_old')
        THEN
          ALTER TYPE role_enum RENAME TO role_enum_old;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
          CREATE TYPE role_enum AS ENUM ('admin_general', 'admin_senior', 'admin_junior', 'user');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
      ALTER TABLE users
      ALTER COLUMN role TYPE role_enum
      USING (
        CASE role::text
          WHEN 'super_admin' THEN 'admin_general'
          WHEN 'admin' THEN 'admin_senior'
          WHEN 'admin_general' THEN 'admin_general'
          WHEN 'admin_senior' THEN 'admin_senior'
          WHEN 'admin_junior' THEN 'admin_junior'
          ELSE 'user'
        END
      )::role_enum;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum_old') THEN
          DROP TYPE role_enum_old;
        END IF;
      END $$;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum_new')
        THEN
          ALTER TYPE role_enum RENAME TO role_enum_new;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
          CREATE TYPE role_enum AS ENUM ('super_admin', 'admin', 'user');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
      ALTER TABLE users
      ALTER COLUMN role TYPE role_enum
      USING (
        CASE role::text
          WHEN 'admin_general' THEN 'super_admin'
          WHEN 'admin_senior' THEN 'admin'
          ELSE 'user'
        END
      )::role_enum;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum_new') THEN
          DROP TYPE role_enum_new;
        END IF;
      END $$;
    `);
  }
};
