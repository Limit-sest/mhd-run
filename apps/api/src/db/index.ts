import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. See apps/api/.env.example.');
}

// `sslmode=require` is already in the rivestack connection string; postgres.js
// honors it. Set `ssl: 'require'` explicitly so it also works if the query
// param is dropped.
export const client = postgres(connectionString, { ssl: 'require' });

export const db = drizzle(client, { schema });

export { schema };
