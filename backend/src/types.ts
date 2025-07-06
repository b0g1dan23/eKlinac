import { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"
import type { PinoLogger } from "hono-pino"

export interface AppBindings {
    Variables: {
        logger: PinoLogger;
        userID?: string;  // Optional for routes that don't require auth
        role?: "teacher" | "parent";  // Optional for routes that don't require auth
    }
}

export interface AuthContext {
    Variables: {
        userID: string;
        role: "teacher" | "parent";
    }
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig, T = {}> = RouteHandler<
    R,
    {
        Variables: AppBindings['Variables'] & (T extends Record<'Variables', any> ? T['Variables'] : {});
    }
>;

// Specific type for auth handlers that need userID and role
export type AuthRouteHandler<R extends RouteConfig> = RouteHandler<
    R,
    {
        Variables: {
            logger: PinoLogger;
            userID: string;
            role: "teacher" | "parent";
        };
    }
>;

// Type for handlers that don't need authentication
export type PublicRouteHandler<R extends RouteConfig> = RouteHandler<
    R,
    {
        Variables: {
            logger: PinoLogger;
        };
    }
>;