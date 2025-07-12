import { emailVerificationsTable } from "@/db/schema";
import { cronDB } from ".";
import { gt } from "drizzle-orm";

async function deleteUnusedVerifications() {
    await cronDB.delete(emailVerificationsTable).where(gt(emailVerificationsTable.expiresAt, new Date()));
}
deleteUnusedVerifications();