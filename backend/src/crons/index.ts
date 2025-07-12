import * as schema from '@/db/schema';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "@/env";

const pool = new Pool({
    connectionString: env.DB_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const cronDB = drizzle(pool, {
    schema,
});
