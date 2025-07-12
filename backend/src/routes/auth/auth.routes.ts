import { teachersSelectSchema, teachersInsertSchema, parentsInsertSchema } from "@/db/schema";
import createErrorSchema from "@/helpers/create-error-schema";
import { BAD_REQUEST, MOVED_PERMANENTLY, NOT_FOUND, OK, PERMANENT_REDIRECT, TOO_MANY_REQUESTS, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/helpers/http-status-codes";
import jsonContent from "@/helpers/json-content";
import jsonContentRequired from "@/helpers/json-content-required";
import { createRoute, z } from "@hono/zod-openapi";
import { parentsSelectSchema } from "@/db/schema";
import { verifyAdminAccess, verifyRefreshToken } from "@/middlewares/auth";
import { rateLimiter } from 'hono-rate-limiter'
import { getConnInfo } from 'hono/bun'

const loginBodySchema = z.object({
    email: z.string().email("Invalid email format").openapi({ description: "User's email address" }),
    password: z.string().min(6, "Password must be at least 6 characters long").openapi({ description: "User's password" }),
})

export const loginRoute = createRoute({
    path: "/auth/login",
    method: "post",
    tags: ["auth"],
    description: "User login route. Allows teachers and parents to log in using email and password.",
    request: {
        body: jsonContentRequired(loginBodySchema, "Login request body"),
        query: z.object({
            role: z.enum(['teacher', 'parent'], {
                description: "Role of the user attempting to log in"
            })
        })
    },
    responses: {
        [OK]: jsonContent(z.object({
            user: z.union([teachersSelectSchema, parentsSelectSchema]).openapi({ description: "User information (teacher or parent)" }),
            accessToken: z.string().openapi({ description: "JWT access token for authenticated user" }),
        }), "Successful login response"),
        [NOT_FOUND]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "User not found response"),
        [UNAUTHORIZED]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Invalid credentials response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(loginBodySchema), "Validation error response"),
    }
})

export const logoutRoute = createRoute({
    path: '/auth/logout',
    method: 'post',
    tags: ['auth'],
    description: "User logout route. Invalidates the current session by clearing cookies.",
    middleware: [verifyRefreshToken],
    request: {
        cookies: z.object({
            refresh_token: z.string().openapi({ description: "Refresh token to be invalidated" })
        })
    },
    responses: {
        [OK]: jsonContent(z.object({ message: z.string().openapi({ description: "Logout success message" }) }), "Successful logout response"),
        [UNAUTHORIZED]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Unauthorized access response"),
    }
})

export const refreshRoute = createRoute({
    path: '/auth/refresh',
    method: 'post',
    tags: ['auth'],
    description: "Refresh access token using a valid refresh token stored in cookies.",
    middleware: [verifyRefreshToken],
    request: {
        cookies: z.object({
            refresh_token: z.string().openapi({ description: "Refresh token for renewing access token" })
        })
    },
    responses: {
        [OK]: jsonContent(z.object({
            accessToken: z.string().openapi({ description: "New JWT access token after refresh" }),
        }), "Successful token refresh response"),
        [UNAUTHORIZED]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Invalid refresh token response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(z.object({ message: z.string().openapi({ description: "Validation error message" }) }), "Validation error response"),
    }
})

export const registerRoute = createRoute({
    path: "/auth/register",
    method: "post",
    tags: ["auth"],
    description: "Parent registration route. Creates a new parent account.",
    request: {
        body: jsonContentRequired(parentsInsertSchema, "Registration request body"),
    },
    responses: {
        [OK]: jsonContent(z.object({
            parent: parentsSelectSchema.openapi({ description: "Registered parent information" }),
            access_token: z.string().openapi({ description: "JWT access token for the registered parent" }),
        }), "Successful registration response"),
        [BAD_REQUEST]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Parent already exists response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(parentsInsertSchema), "Validation error response"),
    }
})

export const verifyEmailRoute = createRoute({
    path: "/auth/verify-email",
    method: "post",
    tags: ["auth"],
    description: "Verify email using a verification code sent to the user's email.",
    request: {
        query: z.object({
            verificationID: z.string().openapi({ description: "Unique ID for the email verification process" }),
        })
    },
    responses: {
        [OK]: jsonContent(z.object({
            accessToken: z.string().openapi({ description: "JWT access token for the user after email verification" }),
        }), "Successful email verification response"),
        [BAD_REQUEST]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Invalid verification code response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(z.object({
            verificationID: z.string().openapi({ description: "Unique ID for the email verification process" }),
        })), "Validation error response"),
    }
})

export const googleLoginRoute = createRoute({
    path: "/auth/google/login",
    method: "get",
    tags: ["Google Login"],
    description: "Google login route. Redirects to Google OAuth URL for authentication.",
    responses: {
        [MOVED_PERMANENTLY]: {
            description: "Redirect to Google OAuth URL",
        }
    }
})

export const googleCallbackRoute = createRoute({
    path: "/auth/google/callback",
    method: "get",
    tags: ["Google Login"],
    description: "Google OAuth callback route. Handles the response from Google after authentication.",
    request: {
        query: z.object({
            code: z.string().optional().openapi({ description: "Authorization code from Google" }),
            error: z.string().optional().openapi({ description: "Error from Google OAuth" }),
        })
    },
    responses: {
        [MOVED_PERMANENTLY]: {
            description: "Redirect to frontend with access token",
        },
    }
})

export const adminLoginRoute = createRoute({
    path: "/auth/admin/login",
    method: "post",
    tags: ["Admin login"],
    description: "Admin login route.",
    middleware: [rateLimiter({
        windowMs: 60 * 60 * 1000,
        limit: 3,
        keyGenerator: (c) => c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || getConnInfo(c).remote.address || 'global',
        message: "Too many requests, please try again later.",
        statusCode: TOO_MANY_REQUESTS,
    })],
    request: {
        body: jsonContentRequired(z.object({
            username: z.string().min(3, "Username must be at least 3 characters long").openapi({ description: "Admin username" }),
            password: z.string().min(6, "Password must be at least 6 characters long").openapi({ description: "Admin password" }),
        }), "Admin login request body")
    },
    responses: {
        [OK]: jsonContent(z.object({
            accessToken: z.string().openapi({ description: "JWT access token for admin" }),
        }), "Successful admin login response"),
        [UNAUTHORIZED]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Invalid credentials response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(z.object({
            username: z.string().min(3, "Username must be at least 3 characters long").openapi({ description: "Admin username" }),
            password: z.string().min(6, "Password must be at least 6 characters long").openapi({ description: "Admin password" }),
        })), "Validation error response"),
        [TOO_MANY_REQUESTS]: jsonContent(z.object({ message: z.string().openapi({ description: "Rate limit error message" }) }), "Rate limit exceeded response"),
    }
})

export const createTeacherRoute = createRoute({
    path: "/auth/create-teacher",
    method: "post",
    tags: ["auth"],
    description: "Create a new teacher account. Only accessible by admins.",
    middleware: [verifyAdminAccess],
    request: {
        cookies: z.object({
            admin_token: z.string().openapi({ description: "Admin token for authentication" }),
        }),
        body: jsonContentRequired(teachersInsertSchema, "Create teacher request body"),
    },
    responses: {
        [OK]: jsonContent(teachersSelectSchema, "Successful teacher creation response"),
        [BAD_REQUEST]: jsonContent(z.object({ message: z.string().openapi({ description: "Error message" }) }), "Teacher already exists response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(teachersInsertSchema), "Validation error response"),
    }
})

export type LoginRoute = typeof loginRoute;
export type LogoutRoute = typeof logoutRoute;
export type RefreshRoute = typeof refreshRoute;
export type RegisterRoute = typeof registerRoute;
export type VerifyEmailRoute = typeof verifyEmailRoute;
export type AdminLoginRoute = typeof adminLoginRoute;
export type CreateTeacherRoute = typeof createTeacherRoute;
export type GoogleLoginRoute = typeof googleLoginRoute;
export type GoogleCallbackRoute = typeof googleCallbackRoute;