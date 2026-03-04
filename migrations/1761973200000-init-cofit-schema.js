module.exports = class InitCofitSchema1761973200000 {
  name = 'InitCofitSchema1761973200000';

  async up(queryRunner) {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
          CREATE TYPE role_enum AS ENUM ('super_admin', 'admin', 'user');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
          CREATE TYPE match_status_enum AS ENUM ('upcoming', 'live', 'finished');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status_enum') THEN
          CREATE TYPE ticket_status_enum AS ENUM ('active', 'used', 'cancelled');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
          CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider_enum') THEN
          CREATE TYPE payment_provider_enum AS ENUM ('mobile_money', 'card', 'cash');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_type_enum') THEN
          CREATE TYPE video_type_enum AS ENUM ('summary', 'highlight', 'gallery');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_platform_enum') THEN
          CREATE TYPE device_platform_enum AS ENUM ('android', 'ios', 'web');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name varchar NOT NULL,
        last_name varchar NOT NULL,
        email varchar NOT NULL UNIQUE,
        phone varchar NOT NULL UNIQUE,
        password_hash varchar NOT NULL,
        role role_enum NOT NULL DEFAULT 'user',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN
          BEGIN
            ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
            ALTER TABLE users
            ALTER COLUMN role TYPE role_enum
            USING (
              CASE
                WHEN role::text = 'super_admin' THEN 'super_admin'::role_enum
                WHEN role::text = 'admin' THEN 'admin'::role_enum
                ELSE 'user'::role_enum
              END
            );
          EXCEPTION WHEN others THEN
            UPDATE users SET role = 'user' WHERE role::text NOT IN ('super_admin', 'admin', 'user');
            ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
            ALTER TABLE users
            ALTER COLUMN role TYPE role_enum
            USING (
              CASE
                WHEN role::text = 'super_admin' THEN 'super_admin'::role_enum
                WHEN role::text = 'admin' THEN 'admin'::role_enum
                ELSE 'user'::role_enum
              END
            );
          END;
          ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
        ELSE
          ALTER TABLE users ADD COLUMN role role_enum NOT NULL DEFAULT 'user';
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        logo_url varchar NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL,
        season varchar NOT NULL,
        start_date date NULL,
        end_date date NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        competition_id uuid NULL,
        home_team_id uuid NOT NULL,
        away_team_id uuid NOT NULL,
        match_date date NOT NULL,
        kickoff_time time NOT NULL,
        stadium varchar NOT NULL,
        ticket_price numeric(10,2) NOT NULL DEFAULT 0,
        status match_status_enum NOT NULL DEFAULT 'upcoming',
        home_score integer NOT NULL DEFAULT 0,
        away_score integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE matches
      ADD COLUMN IF NOT EXISTS competition_id uuid,
      ADD COLUMN IF NOT EXISTS home_team_id uuid,
      ADD COLUMN IF NOT EXISTS away_team_id uuid,
      ADD COLUMN IF NOT EXISTS match_date date,
      ADD COLUMN IF NOT EXISTS kickoff_time time,
      ADD COLUMN IF NOT EXISTS stadium varchar,
      ADD COLUMN IF NOT EXISTS ticket_price numeric(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS status match_status_enum NOT NULL DEFAULT 'upcoming',
      ADD COLUMN IF NOT EXISTS home_score integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS away_score integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_competition') THEN
          ALTER TABLE matches
          ADD CONSTRAINT fk_matches_competition
          FOREIGN KEY (competition_id) REFERENCES competitions(id)
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_home_team') THEN
          ALTER TABLE matches
          ADD CONSTRAINT fk_matches_home_team
          FOREIGN KEY (home_team_id) REFERENCES teams(id)
          ON DELETE RESTRICT;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_away_team') THEN
          ALTER TABLE matches
          ADD CONSTRAINT fk_matches_away_team
          FOREIGN KEY (away_team_id) REFERENCES teams(id)
          ON DELETE RESTRICT;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS standings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        competition_id uuid NOT NULL,
        team_id uuid NOT NULL,
        played integer NOT NULL DEFAULT 0,
        won integer NOT NULL DEFAULT 0,
        draw integer NOT NULL DEFAULT 0,
        lost integer NOT NULL DEFAULT 0,
        goals_for integer NOT NULL DEFAULT 0,
        goals_against integer NOT NULL DEFAULT 0,
        points integer NOT NULL DEFAULT 0
      );
    `);

    await queryRunner.query(`
      ALTER TABLE standings
      ADD COLUMN IF NOT EXISTS competition_id uuid,
      ADD COLUMN IF NOT EXISTS team_id uuid,
      ADD COLUMN IF NOT EXISTS played integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS won integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS draw integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lost integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS goals_for integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS goals_against integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_standings_competition_team
      ON standings (competition_id, team_id);
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_standings_competition') THEN
          ALTER TABLE standings
          ADD CONSTRAINT fk_standings_competition
          FOREIGN KEY (competition_id) REFERENCES competitions(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_standings_team') THEN
          ALTER TABLE standings
          ADD CONSTRAINT fk_standings_team
          FOREIGN KEY (team_id) REFERENCES teams(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS news (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        content text NOT NULL,
        image_url varchar NULL,
        is_published boolean NOT NULL DEFAULT true,
        published_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        video_url varchar NOT NULL,
        type video_type_enum NOT NULL DEFAULT 'summary',
        match_id uuid NULL,
        is_published boolean NOT NULL DEFAULT true,
        published_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE videos
      ADD COLUMN IF NOT EXISTS title varchar,
      ADD COLUMN IF NOT EXISTS video_url varchar,
      ADD COLUMN IF NOT EXISTS type video_type_enum NOT NULL DEFAULT 'summary',
      ADD COLUMN IF NOT EXISTS match_id uuid,
      ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS published_at timestamptz,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_videos_match') THEN
          ALTER TABLE videos
          ADD CONSTRAINT fk_videos_match
          FOREIGN KEY (match_id) REFERENCES matches(id)
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS supporter_cards (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        card_code varchar NOT NULL UNIQUE,
        qr_code varchar NOT NULL UNIQUE,
        start_date date NOT NULL,
        end_date date NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE supporter_cards
      ADD COLUMN IF NOT EXISTS user_id uuid,
      ADD COLUMN IF NOT EXISTS card_code varchar,
      ADD COLUMN IF NOT EXISTS qr_code varchar,
      ADD COLUMN IF NOT EXISTS start_date date,
      ADD COLUMN IF NOT EXISTS end_date date,
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_supporter_cards_user') THEN
          ALTER TABLE supporter_cards
          ADD CONSTRAINT fk_supporter_cards_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        ticket_date date NOT NULL,
        qr_code varchar NOT NULL UNIQUE,
        status ticket_status_enum NOT NULL DEFAULT 'active',
        payment_status payment_status_enum NOT NULL DEFAULT 'pending',
        amount numeric(10,2) NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS user_id uuid,
      ADD COLUMN IF NOT EXISTS ticket_date date,
      ADD COLUMN IF NOT EXISTS qr_code varchar,
      ADD COLUMN IF NOT EXISTS status ticket_status_enum NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS payment_status payment_status_enum NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS amount numeric(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_user_date
      ON tickets (user_id, ticket_date);
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tickets_user') THEN
          ALTER TABLE tickets
          ADD CONSTRAINT fk_tickets_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        ticket_id uuid NULL,
        supporter_card_id uuid NULL,
        amount numeric(10,2) NOT NULL,
        provider payment_provider_enum NOT NULL,
        status payment_status_enum NOT NULL DEFAULT 'pending',
        external_reference varchar NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS user_id uuid,
      ADD COLUMN IF NOT EXISTS ticket_id uuid,
      ADD COLUMN IF NOT EXISTS supporter_card_id uuid,
      ADD COLUMN IF NOT EXISTS amount numeric(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS provider payment_provider_enum,
      ADD COLUMN IF NOT EXISTS status payment_status_enum NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS external_reference varchar,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_user') THEN
          ALTER TABLE payments
          ADD CONSTRAINT fk_payments_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_ticket') THEN
          ALTER TABLE payments
          ADD CONSTRAINT fk_payments_ticket
          FOREIGN KEY (ticket_id) REFERENCES tickets(id)
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_supporter_card') THEN
          ALTER TABLE payments
          ADD CONSTRAINT fk_payments_supporter_card
          FOREIGN KEY (supporter_card_id) REFERENCES supporter_cards(id)
          ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        device_token varchar NOT NULL UNIQUE,
        platform device_platform_enum NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE device_tokens
      ADD COLUMN IF NOT EXISTS user_id uuid,
      ADD COLUMN IF NOT EXISTS device_token varchar,
      ADD COLUMN IF NOT EXISTS platform device_platform_enum,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_device_tokens_user') THEN
          ALTER TABLE device_tokens
          ADD CONSTRAINT fk_device_tokens_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS device_tokens;`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS tickets;`);
    await queryRunner.query(`DROP TABLE IF EXISTS supporter_cards;`);
    await queryRunner.query(`DROP TABLE IF EXISTS videos;`);
    await queryRunner.query(`DROP TABLE IF EXISTS news;`);
    await queryRunner.query(`DROP TABLE IF EXISTS standings;`);
    await queryRunner.query(`DROP TABLE IF EXISTS matches;`);
    await queryRunner.query(`DROP TABLE IF EXISTS competitions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS teams;`);

    await queryRunner.query(`DROP TYPE IF EXISTS device_platform_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS video_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_provider_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS ticket_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS match_status_enum;`);
  }
};
