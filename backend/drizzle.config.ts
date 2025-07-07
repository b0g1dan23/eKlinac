import env from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dbCredentials: {
        url: env.DB_URL,
        ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    },
});