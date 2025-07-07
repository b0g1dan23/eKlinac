import env from '@/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: env.DB_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, {
    schema,
});

export default db;