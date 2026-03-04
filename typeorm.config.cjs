require('dotenv').config();
const { DataSource } = require('typeorm');

const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  process.env.NODE_ENV === 'production';

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['migrations/*.js'],
});
