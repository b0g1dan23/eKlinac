import { z, ZodError } from 'zod';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

expand(config());

const EnvSchema = z.object({
    NODE_ENV: z.string(),
    PORT: z.coerce.number(),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
    DB_URL: z.string(),
    JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters long"),
    REDIS_URL: z.string().startsWith("redis://").or(z.string().startsWith("rediss://")),
    ADMIN_USERNAME: z.string().min(3, "Admin username must be at least 3 characters long"),
    ADMIN_PASSWORD: z.string().min(6, "Admin password must be at least 6 characters long"),
    MAILJET_API_KEY: z.string(),
    MAILJET_SECRET_KEY: z.string(),
    EMAIL_FROM: z.string().email("Invalid email format for EMAIL_FROM"),
    EMAIL_FROM_NAME: z.string().min(1, "EMAIL_FROM_NAME must not be empty"),
    PROJECT_NAME: z.string().min(1, "PROJECT_NAME must not be empty"),
    FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID must not be empty"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET must not be empty"),
}).transform((data) => {
    if (data.NODE_ENV === 'test') {
        return {
            ...data,
            DB_URL: 'file::memory:?cache=shared'
        };
    }
    return data;
});

export type envType = z.infer<typeof EnvSchema>;

let env: envType;
try {
    env = EnvSchema.parse(process.env);
} catch (err) {
    const e = err as ZodError;
    console.error("Invalid ENV: ");
    console.error(e.flatten().fieldErrors);
    process.exit(1);
}

export default env;