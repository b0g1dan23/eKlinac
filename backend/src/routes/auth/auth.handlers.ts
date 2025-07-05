import { AppRouteHandler } from "@/types";
import { LoginRoute } from "./auth.routes";
import { NOT_FOUND, OK, UNAUTHORIZED } from "@/helpers/http-status-codes";
import db from "@/db";
import { parents, teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import env from "@/env";
import { setCookie } from 'hono/cookie';
import redisClient from "@/db/redis";

export const loginHandler: AppRouteHandler<LoginRoute> = async (c) => {
    const { email, password } = c.req.valid('json');
    const { role } = c.req.valid('query');

    switch (role) {
        case 'teacher':
            const [dbRes] = await db.select().from(teachers)
                .where(eq(teachers.email, email));
            if (!dbRes) {
                return c.json({ message: 'User not found' }, NOT_FOUND);
            }

            const verified = await Bun.password.verify(password, dbRes.passwordHash)
            if (!verified) {
                return c.json({ error: 'Invalid credentials' }, UNAUTHORIZED);
            }

            const accessToken = jwt.sign({ user_id: dbRes.id, role }, env.JWT_SECRET, {
                expiresIn: '15m',
            })

            const refreshToken = jwt.sign({ user_id: dbRes.id, role }, env.JWT_SECRET, {
                expiresIn: '7d',
            })

            await redisClient.set(`refresh_token:${dbRes.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);
            setCookie(c, 'refresh_token', refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'Strict',
            })

            const { passwordHash: teacherPasswordHash, ...teacherWithoutPassword } = dbRes;

            return c.json({ user: teacherWithoutPassword, accessToken }, OK);
        case 'parent':
            const [parent] = await db.select().from(parents)
                .where(eq(parents.email, email));
            if (!parent) {
                return c.json({ message: 'User not found' }, NOT_FOUND);
            }

            const parentVerified = await Bun.password.verify(password, parent.passwordHash)
            if (!parentVerified) {
                return c.json({ error: 'Invalid credentials' }, UNAUTHORIZED);
            }

            const parentAccessToken = jwt.sign({ user_id: parent.id, role }, env.JWT_SECRET, {
                expiresIn: '15m',
            })

            const parentRefreshToken = jwt.sign({ user_id: parent.id, role }, env.JWT_SECRET, {
                expiresIn: '7d',
            })

            await redisClient.set(`refresh_token:${parent.id}`, parentRefreshToken, "EX", 60 * 60 * 24 * 7);
            setCookie(c, 'refresh_token', parentRefreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'Strict',
            })

            const { passwordHash, ...parentWithoutPassword } = parent;
            return c.json({ user: parentWithoutPassword, accessToken: parentAccessToken }, OK);
    }

    return c.json({ message: "User not found" }, NOT_FOUND)
}