import { childrenSelectSchema, teachersSelectSchema } from "@/db/schema";
import { BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/helpers/http-status-codes";
import jsonContent from "@/helpers/json-content";
import { verifyAccessToken, verifyAdminAccess } from "@/middlewares/auth";
import { createRoute, z } from "@hono/zod-openapi";

export const listAllTeachersRoute = createRoute({
    path: "/teachers",
    method: "get",
    middleware: [verifyAdminAccess],
    tags: ["teachers"],
    description: "List all teachers in the system. Only for admins.",
    request: {
        cookies: z.object({
            admin_token: z.string().openapi({ description: "Admin token for authentication" }),
        })
    },
    responses: {
        [OK]: jsonContent(z.array(teachersSelectSchema), "List of all teachers"),
    },
})

export const listAllStudentsForTeacherRoute = createRoute({
    path: "/teachers/:teacherID/students",
    method: "get",
    tags: ["teachers"],
    middleware: [verifyAccessToken],
    description: "List all students for a specific teacher",
    request: {
        headers: z.object({
            Authorization: z.string().openapi({ description: "Bearer token for authentication" }),
        }),
        params: z.object({
            teacherID: z.string().openapi({ description: "ID of the teacher to list students for" }),
        }),
    },
    responses: {
        [OK]: jsonContent(z.array(childrenSelectSchema), "List of students for the specified teacher"),
        [NOT_FOUND]: jsonContent(z.object({ message: z.string() }), "Teacher not found"),
        [UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), "Unauthorized access"),
        [UNPROCESSABLE_ENTITY]: jsonContent(z.object({ message: z.string() }), "Validation error"),
        [BAD_REQUEST]: jsonContent(z.object({ message: z.string(), stack: z.string() }), "Invalid teacher ID"),
    },
})

export type ListAllTeachersRoute = typeof listAllTeachersRoute;
export type ListAllStudentsForTeacherRoute = typeof listAllStudentsForTeacherRoute;