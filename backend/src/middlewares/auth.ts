import env from "@/env";
import { Context, Next } from "hono";
import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken'
import { getCookie } from "hono/cookie";
import redisClient from "@/db/redis";
import { UNAUTHORIZED } from "@/helpers/http-status-codes";
import { AuthContext } from "@/types";

export const verifyAccessToken = createMiddleware(async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Authorization header is missing or invalid" }, UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        return c.json({ error: "Token is missing" }, UNAUTHORIZED);
    }

    jwt.verify(token, env.JWT_SECRET, (err) => {
        if (err) {
            return c.json({ error: "Invalid token" }, UNAUTHORIZED);
        }
    });
    await next();
})


export const verifyRefreshToken = createMiddleware<AuthContext>(async (c: Context, next: Next) => {
    const refreshToken = getCookie(c, 'refresh_token');
    if (!refreshToken) {
        return c.json({ error: "Refresh token is missing" }, UNAUTHORIZED);
    }

    try {
        const { user_id, role } = jwt.verify(refreshToken, env.JWT_SECRET) as { user_id: string, role: "teacher" | "parent" };
        c.set('userID', user_id);
        c.set('role', role);
    } catch (err) {
        return c.json({ error: "Invalid refresh token" }, UNAUTHORIZED);
    }

    const storedToken = await redisClient.get(`refresh_token:${c.get('userID')}`);
    if (!storedToken) {
        return c.json({ error: "Refresh token not found in db" }, UNAUTHORIZED);
    }

    await next();
})

export const verifyAdminAccess = createMiddleware<AuthContext>(async (c: Context, next: Next) => {
    const adminToken = getCookie(c, 'admin_token');
    if (!adminToken) {
        return c.json({ error: "Admin token is missing" }, UNAUTHORIZED);
    }

    jwt.verify(adminToken, env.JWT_SECRET, (err) => {
        if (err) {
            return c.json({ error: "Invalid admin token" }, UNAUTHORIZED);
        }
    });

    await next();
})