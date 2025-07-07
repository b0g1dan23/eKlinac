import db from "@/db"
import { children, teachers } from "@/db/schema"
import { OK } from "@/helpers/http-status-codes";
import { AppRouteHandler } from "@/types";
import { ListAllStudentsForTeacherRoute, ListAllTeachersRoute } from "./teachers.routes";
import { eq } from "drizzle-orm";

export const listAllTeachersHandler: AppRouteHandler<ListAllTeachersRoute> = async (c) => {
    const allTeachers = await db.select().from(teachers);
    return c.json(allTeachers, OK);
}

export const listAllStudentsForTeacherHandler: AppRouteHandler<ListAllStudentsForTeacherRoute> = async (c) => {
    const { teacherID } = c.req.valid('param');

    const students = await db.select().from(children).where(eq(children.primaryTeacherId, teacherID));
    return c.json(students, OK);
}