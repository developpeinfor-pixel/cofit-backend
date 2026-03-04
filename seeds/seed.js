require('dotenv').config();
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
});

async function ensureUser({
  firstName,
  lastName,
  email,
  phone,
  password,
  role,
}) {
  const existing = await dataSource.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inserted = await dataSource.query(
    `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6::role_enum, true)
      RETURNING id
    `,
    [firstName, lastName, email, phone, passwordHash, role],
  );

  return inserted[0].id;
}

async function seedUsers() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@cofit.app';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '+10000000000';

  const superAdminId = await ensureUser({
    firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
    email: superAdminEmail,
    phone: superAdminPhone,
    password: superAdminPassword,
    role: 'super_admin',
  });

  const adminId = await ensureUser({
    firstName: 'Main',
    lastName: 'Admin',
    email: 'admin@cofit.app',
    phone: '+10000000001',
    password: 'Admin123!',
    role: 'admin',
  });

  const userId = await ensureUser({
    firstName: 'Demo',
    lastName: 'User',
    email: 'user@cofit.app',
    phone: '+10000000002',
    password: 'User123!',
    role: 'user',
  });

  return { superAdminId, adminId, userId };
}

async function seedTeams() {
  const teams = [
    'AS Abidjan',
    'Stella Club',
    'Africa Sports',
    'ASEC Mimosas',
    'SOA',
    'FC San Pedro',
  ];

  for (const name of teams) {
    await dataSource.query(
      `
        INSERT INTO teams (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `,
      [name],
    );
  }
}

async function seedCompetitionAndMatches() {
  const compResult = await dataSource.query(
    `
      INSERT INTO competitions (name, season, start_date, end_date)
      VALUES ('Ligue 1 Cote d''Ivoire', '2026', '2026-01-10', '2026-12-20')
      ON CONFLICT DO NOTHING
      RETURNING id
    `,
  );

  let competitionId = compResult[0]?.id;
  if (!competitionId) {
    const rows = await dataSource.query(
      `
        SELECT id FROM competitions
        WHERE name = 'Ligue 1 Cote d''Ivoire' AND season = '2026'
        LIMIT 1
      `,
    );
    competitionId = rows[0]?.id;
  }

  const teamRows = await dataSource.query(
    `SELECT id, name FROM teams WHERE name IN ($1, $2, $3, $4) ORDER BY name`,
    ['AS Abidjan', 'Stella Club', 'Africa Sports', 'ASEC Mimosas'],
  );
  const teamMap = {};
  for (const t of teamRows) {
    teamMap[t.name] = t.id;
  }

  const matches = [
    {
      home: 'AS Abidjan',
      away: 'Stella Club',
      date: '2026-03-01',
      time: '15:30:00',
      stadium: 'Stade Felix Houphouet-Boigny',
      price: '2500.00',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0,
      totalSeats: 20000,
      availableSeats: 20000,
    },
    {
      home: 'Africa Sports',
      away: 'ASEC Mimosas',
      date: '2026-03-01',
      time: '18:00:00',
      stadium: 'Stade Robert Champroux',
      price: '2500.00',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0,
      totalSeats: 18000,
      availableSeats: 18000,
    },
    {
      home: 'AS Abidjan',
      away: 'ASEC Mimosas',
      date: '2026-02-20',
      time: '16:00:00',
      stadium: 'Stade Felix Houphouet-Boigny',
      price: '2500.00',
      status: 'finished',
      homeScore: 1,
      awayScore: 2,
      totalSeats: 20000,
      availableSeats: 0,
    },
  ];

  const matchColumnsRes = await dataSource.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches'
  `);
  const hasHomeTeamText = matchColumnsRes.some((c) => c.column_name === 'home_team');
  const hasAwayTeamText = matchColumnsRes.some((c) => c.column_name === 'away_team');
  const hasTotalSeats = matchColumnsRes.some((c) => c.column_name === 'total_seats');
  const hasAvailableSeats = matchColumnsRes.some((c) => c.column_name === 'available_seats');

  for (const m of matches) {
    if (!teamMap[m.home] || !teamMap[m.away] || !competitionId) {
      continue;
    }

    const columns = [
      'competition_id',
      'home_team_id',
      'away_team_id',
      'match_date',
      'kickoff_time',
      'stadium',
      'ticket_price',
      'status',
      'home_score',
      'away_score',
    ];
    const values = [
      competitionId,
      teamMap[m.home],
      teamMap[m.away],
      m.date,
      m.time,
      m.stadium,
      m.price,
      m.status,
      m.homeScore,
      m.awayScore,
    ];

    if (hasHomeTeamText) {
      columns.push('home_team');
      values.push(m.home);
    }
    if (hasAwayTeamText) {
      columns.push('away_team');
      values.push(m.away);
    }
    if (hasTotalSeats) {
      columns.push('total_seats');
      values.push(m.totalSeats);
    }
    if (hasAvailableSeats) {
      columns.push('available_seats');
      values.push(m.availableSeats);
    }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    await dataSource.query(
      `
        INSERT INTO matches (${columns.join(', ')})
        SELECT ${placeholders}
        WHERE NOT EXISTS (
          SELECT 1 FROM matches
          WHERE competition_id = $1::uuid
            AND home_team_id = $2::uuid
            AND away_team_id = $3::uuid
            AND match_date::date = $4::date
            AND kickoff_time = $5::time
        )
      `,
      values,
    );
  }

  return { competitionId, teamMap };
}

async function seedStandings(competitionId, teamMap) {
  const rows = [
    { team: 'ASEC Mimosas', played: 5, won: 4, draw: 1, lost: 0, gf: 10, ga: 3, pts: 13 },
    { team: 'AS Abidjan', played: 5, won: 3, draw: 1, lost: 1, gf: 8, ga: 5, pts: 10 },
    { team: 'Africa Sports', played: 5, won: 2, draw: 1, lost: 2, gf: 6, ga: 6, pts: 7 },
    { team: 'Stella Club', played: 5, won: 1, draw: 1, lost: 3, gf: 4, ga: 8, pts: 4 },
  ];

  for (const row of rows) {
    const teamId = teamMap[row.team];
    if (!competitionId || !teamId) {
      continue;
    }

    await dataSource.query(
      `
        INSERT INTO standings (
          competition_id,
          team_id,
          played,
          won,
          draw,
          lost,
          goals_for,
          goals_against,
          points
        )
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (competition_id, team_id)
        DO UPDATE SET
          played = EXCLUDED.played,
          won = EXCLUDED.won,
          draw = EXCLUDED.draw,
          lost = EXCLUDED.lost,
          goals_for = EXCLUDED.goals_for,
          goals_against = EXCLUDED.goals_against,
          points = EXCLUDED.points
      `,
      [
        competitionId,
        teamId,
        row.played,
        row.won,
        row.draw,
        row.lost,
        row.gf,
        row.ga,
        row.pts,
      ],
    );
  }
}

async function seedNewsAndVideos() {
  await dataSource.query(
    `
      INSERT INTO news (title, content, image_url, is_published, published_at)
      SELECT
        'Ouverture de la billetterie',
        'La billetterie officielle est disponible sur l''application mobile.',
        NULL,
        true,
        now()
      WHERE NOT EXISTS (
        SELECT 1 FROM news WHERE title = 'Ouverture de la billetterie'
      )
    `,
  );

  await dataSource.query(
    `
      INSERT INTO news (title, content, image_url, is_published, published_at)
      SELECT
        'Lancement Carte Supporters',
        'La carte supporters donne un acces illimite aux matchs pendant sa validite.',
        NULL,
        true,
        now()
      WHERE NOT EXISTS (
        SELECT 1 FROM news WHERE title = 'Lancement Carte Supporters'
      )
    `,
  );

  await dataSource.query(
    `
      INSERT INTO videos (title, video_url, type, is_published, published_at)
      SELECT
        'Best Of Journee 1',
        'https://example.com/videos/best-of-journee-1',
        'highlight'::video_type_enum,
        true,
        now()
      WHERE NOT EXISTS (
        SELECT 1 FROM videos WHERE title = 'Best Of Journee 1'
      )
    `,
  );
}

async function main() {
  await dataSource.initialize();
  console.log('[seed] database connected');

  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
          AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
      END IF;
    END$$;
  `);

  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'matches' AND column_name = 'home_team'
      ) THEN
        ALTER TABLE matches ALTER COLUMN home_team DROP NOT NULL;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'matches' AND column_name = 'away_team'
      ) THEN
        ALTER TABLE matches ALTER COLUMN away_team DROP NOT NULL;
      END IF;
    END$$;
  `);

  const users = await seedUsers();
  console.log('[seed] users seeded', users);

  await seedTeams();
  console.log('[seed] teams seeded');

  const { competitionId, teamMap } = await seedCompetitionAndMatches();
  console.log('[seed] competition and matches seeded', { competitionId });

  await seedStandings(competitionId, teamMap);
  console.log('[seed] standings seeded');

  await seedNewsAndVideos();
  console.log('[seed] news and videos seeded');

  await dataSource.destroy();
  console.log('[seed] done');
}

main().catch(async (error) => {
  console.error('[seed] failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
