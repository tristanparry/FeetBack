import { Pool } from '../../node_modules/@types/pg/index.js';

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

console.info('PostgreSQL connection pool initialized.');

export default pool;
