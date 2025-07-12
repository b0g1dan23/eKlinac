import { AppRouteHandler, AuthContext } from "@/types";
import { AdminLoginRoute, CreateTeacherRoute, GoogleLoginRoute, LoginRoute, LogoutRoute, RefreshRoute, RegisterRoute, VerifyEmailRoute } from "./auth.routes";
import { BAD_REQUEST, MOVED_PERMANENTLY, NOT_FOUND, OK, UNAUTHORIZED } from "@/helpers/http-status-codes";
import db from "@/db";
import { emailVerificationsTable, parentsTable, teachersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import env from "@/env";
import { setCookie, deleteCookie } from 'hono/cookie';
import redisClient from "@/db/redis";
import { Context } from "hono";
import { sendVerifyEmail } from "@/lib/sending-emails";

export function generateTokens(userID: string, role: "teacher" | "parent", email_verified: boolean = false) {
    const accessToken = jwt.sign({ user_id: userID, role, email_verified }, env.JWT_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ user_id: userID, role, email_verified }, env.JWT_SECRET, {
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
            const [dbRes] = await db.select().from(teachersTable)
                .where(eq(teachersTable.email, email));
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
            const [parent] = await db.select().from(parentsTable)
                .where(eq(parentsTable.email, email));
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

    const [existingParent] = await db.select().from(parentsTable)
        .where(eq(parentsTable.email, body.email));

    if (existingParent) {
        return c.json({ message: "Parent with this email already exists!" }, BAD_REQUEST);
    }

    const passwordHash = await Bun.password.hash(body.password);
    const [insertedParent] = await db.insert(parentsTable).values({ ...body, passwordHash }).returning();
    const { passwordHash: ph, ...restInsertedParent } = insertedParent;

    const { accessToken, refreshToken } = generateTokens(restInsertedParent.id, 'parent', false);
    setRefreshTokenCookie(c, refreshToken);
    await redisClient.set(`refresh_token:${restInsertedParent.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);
    const [verification] = await db.insert(emailVerificationsTable).values({
        parentId: restInsertedParent.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    }).returning();

    const verificationURL = `${env.FRONTEND_URL}/auth/verify-email?verificationID=${verification.id}`;
    sendVerifyEmail(restInsertedParent.email, restInsertedParent.firstName, verificationURL);

    return c.json({ parent: restInsertedParent, access_token: accessToken }, OK);
}

export const verifyEmailHandler: AppRouteHandler<VerifyEmailRoute> = async (c) => {
    const { verificationID } = c.req.valid('query');
    const res = await db.select()
        .from(emailVerificationsTable)
        .innerJoin(parentsTable, eq(parentsTable.id, emailVerificationsTable.parentId))
        .where(eq(emailVerificationsTable.id, verificationID));

    if (res.length === 0) {
        return c.json({ message: "Invalid verification ID!" }, BAD_REQUEST);
    }

    const { email_verifications } = res[0];
    if (email_verifications.expiresAt < new Date()) {
        return c.json({ message: "Verification link has expired!" }, BAD_REQUEST);
    }

    await db.update(parentsTable).set({ email_verified: true });
    await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.id, verificationID));

    const { accessToken, refreshToken } = generateTokens(res[0].parents.id, 'parent', false);
    setRefreshTokenCookie(c, refreshToken);

    return c.json({ accessToken }, OK);
}

export const googleLoginHandler: AppRouteHandler<GoogleLoginRoute> = async (c) => {
    // Generate Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(`${c.req.url.split('/api')[0]}/api/v1/auth/google/callback`)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `access_type=offline`;

    return c.redirect(googleAuthUrl, MOVED_PERMANENTLY);
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
    const [existingTeacher] = await db.select().from(teachersTable)
        .where(eq(teachersTable.email, body.email));

    if (existingTeacher) {
        return c.json({ message: "Teacher with this email already exists!" }, BAD_REQUEST);
    }

    const [insertedTeacher] = await db.insert(teachersTable).values({ ...body, passwordHash }).returning();
    const { passwordHash: ph, ...restInsertedTeacher } = insertedTeacher;
    return c.json(restInsertedTeacher, OK);
}

export const googleCallbackHandler = async (c: Context) => {
    const code = c.req.query('code');
    const error = c.req.query('error');

    if (error) {
        return c.json({ error: 'Google authentication failed' }, BAD_REQUEST);
    }

    if (!code) {
        return c.json({ error: 'Missing authorization code' }, BAD_REQUEST);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: env.GOOGLE_CLIENT_ID,
                client_secret: env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${c.req.url.split('/auth/google/callback')[0]}/auth/google/callback`
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return c.json({ error: 'Token exchange failed' }, BAD_REQUEST);
        }

        // Get user info from Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            return c.json({ error: 'Failed to get user info' }, BAD_REQUEST);
        }

        // Check if user exists or create new one
        let [existingParent] = await db.select().from(parentsTable)
            .where(eq(parentsTable.email, userData.email));

        if (existingParent) {
            // Update Google ID if not set
            if (!existingParent.googleId) {
                await db.update(parentsTable)
                    .set({
                        googleId: userData.id,
                        email_verified: true
                    })
                    .where(eq(parentsTable.id, existingParent.id));

                // Get updated data
                [existingParent] = await db.select().from(parentsTable)
                    .where(eq(parentsTable.id, existingParent.id));
            }
        } else {
            // Create new user
            [existingParent] = await db.insert(parentsTable).values({
                email: userData.email,
                firstName: userData.given_name || userData.name.split(' ')[0],
                lastName: userData.family_name || userData.name.split(' ').slice(1).join(' '),
                googleId: userData.id,
                email_verified: true,
                passwordHash: '' // No password for Google users
            }).returning();
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(existingParent.id, 'parent', true);

        // Set refresh token cookie
        setRefreshTokenCookie(c, refreshToken);
        await redisClient.set(`refresh_token:${existingParent.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

        // Return access token as JSON
        return c.redirect(`${env.FRONTEND_URL}/auth/callback?access_token=${accessToken}`, MOVED_PERMANENTLY);

    } catch (error) {
        console.error('Google OAuth error:', error);
        return c.json({ error: 'Google authentication error' }, BAD_REQUEST);
    }
};