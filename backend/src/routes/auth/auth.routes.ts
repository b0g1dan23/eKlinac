import { teacherSelectSchema } from "@/db/schema";
import createErrorSchema from "@/helpers/create-error-schema";
import { NOT_FOUND, OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/helpers/http-status-codes";
import jsonContent from "@/helpers/json-content";
import jsonContentRequired from "@/helpers/json-content-required";
import { createRoute, z } from "@hono/zod-openapi";
import { parentsSelectSchema } from "@/db/schema";

const loginBodySchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const loginRoute = createRoute({
    path: "/login",
    method: "post",
    tags: ["auth"],
    request: {
        body: jsonContentRequired(loginBodySchema, "Login request body"),
        query: z.object({
            role: z.enum(['teacher', 'student', 'parent'], {
                description: "Role of the user attempting to log in"
            })
        })
    },
    responses: {
        [OK]: jsonContent(z.object({
            user: z.union([teacherSelectSchema, parentsSelectSchema]),
            accessToken: z.string().openapi({ description: "JWT access token for authenticated user" }),
        }), "Successful login response"),
        [NOT_FOUND]: jsonContent(z.object({ message: z.string() }), "User not found response"),
        [UNAUTHORIZED]: jsonContent(z.object({ error: z.string() }), "Invalid credentials response"),
        [UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(loginBodySchema), "Validation error response"),
    }
})

export type LoginRoute = typeof loginRoute;