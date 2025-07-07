import { AppRouteHandler, AuthContext } from "@/types";
import { AdminLoginRoute, CreateTeacherRoute, LoginRoute, LogoutRoute, RefreshRoute, RegisterRoute } from "./auth.routes";
import { BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED } from "@/helpers/http-status-codes";
import db from "@/db";
import { parents, teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import env from "@/env";
import { setCookie, deleteCookie } from 'hono/cookie';
import redisClient from "@/db/redis";
import { Context } from "hono";

export function generateTokens(userID: string, role: "teacher" | "parent") {
    const accessToken = jwt.sign({ user_id: userID, role }, env.JWT_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ user_id: userID, role }, env.JWT_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
}

export function setRefreshTokenCookie(c: Context, refreshToken: string) {
    setCookie(c, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
}

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
                return c.json({ message: 'Invalid credentials' }, UNAUTHORIZED);
            }

            const { accessToken, refreshToken } = generateTokens(dbRes.id, role);

            setRefreshTokenCookie(c, refreshToken);
            await redisClient.set(`refresh_token:${dbRes.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

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
                return c.json({ message: 'Invalid credentials' }, UNAUTHORIZED);
            }

            const { accessToken: parentAccessToken, refreshToken: parentRefreshToken } = generateTokens(parent.id, role);

            setRefreshTokenCookie(c, parentRefreshToken);
            await redisClient.set(`refresh_token:${parent.id}`, parentRefreshToken, "EX", 60 * 60 * 24 * 7);

            const { passwordHash, ...parentWithoutPassword } = parent;
            return c.json({ user: parentWithoutPassword, accessToken: parentAccessToken }, OK);
    }
}

export const logoutHandler: AppRouteHandler<LogoutRoute, AuthContext> = async (c) => {
    deleteCookie(c, 'refresh_token');
    deleteCookie(c, 'access_token');
    await redisClient.del(`refresh_token:${c.get('userID')}`);
    return c.json({ message: 'Logged out successfully' }, OK);
}

export const refreshHandler: AppRouteHandler<RefreshRoute, AuthContext> = async (c) => {
    const userID = c.get('userID')
    const role = c.get('role')

    const accessToken = jwt.sign({ user_id: userID, role }, env.JWT_SECRET, {
        expiresIn: '15m',
    });

    return c.json({ accessToken }, OK);
}

export const registerHandler: AppRouteHandler<RegisterRoute> = async (c) => {
    const body = c.req.valid('json');

    const [existingParent] = await db.select().from(parents)
        .where(eq(parents.email, body.email));

    if (existingParent) {
        return c.json({ message: "Parent with this email already exists!" }, BAD_REQUEST);
    }

    const passwordHash = await Bun.password.hash(body.password);
    const [insertedParent] = await db.insert(parents).values({ ...body, passwordHash }).returning();
    const { passwordHash: ph, ...restInsertedParent } = insertedParent;
    return c.json(restInsertedParent, OK);
}

export const adminLoginHandler: AppRouteHandler<AdminLoginRoute> = async (c) => {
    const { username, password } = c.req.valid('json');

    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        const adminToken = jwt.sign({ user_id: 'admin' }, env.JWT_SECRET, {
            expiresIn: '365d',
        })
        setCookie(c, 'admin_token', adminToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'Strict',
        })
        return c.json({ accessToken: adminToken }, OK);
    }

    return c.json({ message: "Invalid admin credentials!" }, UNAUTHORIZED);
}

export const createTeacherHandler: AppRouteHandler<CreateTeacherRoute> = async (c) => {
    const body = c.req.valid('json');

    const passwordHash = await Bun.password.hash(body.password);
    const [existingTeacher] = await db.select().from(teachers)
        .where(eq(teachers.email, body.email));

    if (existingTeacher) {
        return c.json({ message: "Teacher with this email already exists!" }, BAD_REQUEST);
    }

    const [insertedTeacher] = await db.insert(teachers).values({ ...body, passwordHash }).returning();
    const { passwordHash: ph, ...restInsertedTeacher } = insertedTeacher;
    return c.json(restInsertedTeacher, OK);
}