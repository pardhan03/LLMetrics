import knex from 'knex';
import 'dotenv/config';

export const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});