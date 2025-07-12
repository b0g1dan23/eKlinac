import db from "@/db"
import { childrenTable, teachersTable } from "@/db/schema"
import { OK } from "@/helpers/http-status-codes";
import { AppRouteHandler } from "@/types";
import { ListAllStudentsForTeacherRoute, ListAllTeachersRoute } from "./teachers.routes";
import { eq } from "drizzle-orm";

export const listAllTeachersHandler: AppRouteHandler<ListAllTeachersRoute> = async (c) => {
    const allTeachers = await db.select().from(teachersTable);
    return c.json(allTeachers, OK);
}

export const listAllStudentsForTeacherHandler: AppRouteHandler<ListAllStudentsForTeacherRoute> = async (c) => {
    const { teacherID } = c.req.valid('param');

    const students = await db.select().from(childrenTable).where(eq(childrenTable.primaryTeacherId, teacherID));
    return c.json(students, OK);
}