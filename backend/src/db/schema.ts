import { integer, text, real, index, boolean, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}

// Teachers table
export const teachersTable = pgTable("teachers", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    bio: text("bio"),
    specializations: text("specializations"), // JSON array of programming languages/topics
    ...timestamps
});

export const teachersSelectSchema = createSelectSchema(teachersTable).omit({
    passwordHash: true,
})

export const teachersInsertSchema = createInsertSchema(teachersTable)
    .merge(z.object({
        password: z.string().min(6, "Password must be at least 6 characters long")
    }))
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
    })

// Parents table
export const parentsTable = pgTable("parents", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    googleId: text("google_id").unique(),
    email_verified: boolean("email_verified").default(false),
    ...timestamps
});

export const parentsSelectSchema = createSelectSchema(parentsTable)
    .omit({
        passwordHash: true,
    })
export const parentsInsertSchema = createInsertSchema(parentsTable)
    .merge(z.object({
        password: z.string().min(6, "Password must be at least 6 characters long")
    }))
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
    })

// Email verification table - stores temporary verification codes
export const emailVerificationsTable = pgTable("email_verifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").notNull().references(() => parentsTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp("expires_at").notNull(), // When this verification expires
    ...timestamps
}, (table) => ({
    parentIdIdx: index("email_verifications_parent_id_idx").on(table.parentId),
    expiresAtIdx: index("email_verifications_expires_at_idx").on(table.expiresAt)
}));

export const emailVerificationsSelectSchema = createSelectSchema(emailVerificationsTable);
export const emailVerificationsInsertSchema = createInsertSchema(emailVerificationsTable)
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    });

// Children/Students table
export const childrenTable = pgTable("children", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    age: integer("age").notNull(),
    parentId: uuid("parent_id").notNull().references(() => parentsTable.id, { onDelete: 'cascade' }),
    primaryTeacherId: uuid("primary_teacher_id").references(() => teachersTable.id, { onDelete: 'cascade' }),
    programmingLevel: text("programming_level").default("beginner"), // beginner, intermediate, advanced
    notes: text("notes"), // General notes about the child
    isActive: boolean("is_active").default(true),
    ...timestamps
}, (table) => ({
    parentIdIdx: index("children_parent_id_idx").on(table.parentId),
    teacherIdIdx: index("children_teacher_id_idx").on(table.primaryTeacherId)
}));

export const childrenSelectSchema = createSelectSchema(childrenTable);

// Lessons table
export const lessonsTable = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id").notNull().references(() => teachersTable.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"), // Teacher's notes from the lesson
    recordingUrl: text("recording_url"), // Link to the lesson recording
    duration: integer("duration"), // Duration in minutes
    status: text("status").default("scheduled"), // scheduled, completed, cancelled
    scheduledAt: timestamp("scheduled_at").notNull(),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    ...timestamps
}, (table) => ({
    teacherIdIdx: index("lessons_teacher_id_idx").on(table.teacherId),
    childIdIdx: index("lessons_child_id_idx").on(table.childId),
    scheduledAtIdx: index("lessons_scheduled_at_idx").on(table.scheduledAt)
}));

// Lesson summaries (AI-generated summaries for parents)
export const lessonSummariesTable = pgTable("lesson_summaries", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").unique().notNull().references(() => lessonsTable.id, { onDelete: 'cascade' }),
    topicsCovered: text("topics_covered"), // JSON array of topics
    childParticipation: text("child_participation"), // How the child participated
    strengths: text("strengths"), // What the child is doing well
    difficulties: text("difficulties"), // Where the child has difficulties
    recommendations: text("recommendations"), // Recommendations for improvement
    generatedAt: timestamp("generated_at").defaultNow(),
    ...timestamps
}, (table) => ({
    lessonIdIdx: index("lesson_summaries_lesson_id_idx").on(table.lessonId)
}));

// Homework table
export const homeworkTable = pgTable("homework", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").notNull().references(() => lessonsTable.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachersTable.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    instructions: text("instructions"), // Detailed instructions
    dueDate: timestamp("due_date").notNull(),
    difficulty: text("difficulty").default("medium"), // easy, medium, hard
    estimatedHours: real("estimated_hours"), // Estimated time to complete
    status: text("status").default("assigned"), // assigned, in_progress, submitted, reviewed, completed
    ...timestamps
}, (table) => ({
    lessonIdIdx: index("homework_lesson_id_idx").on(table.lessonId),
    childIdIdx: index("homework_child_id_idx").on(table.childId),
    dueDateIdx: index("homework_due_date_idx").on(table.dueDate),
    statusIdx: index("homework_status_idx").on(table.status)
}));

// Homework submissions
export const homeworkSubmissionsTable = pgTable("homework_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    homeworkId: uuid("homework_id").notNull().references(() => homeworkTable.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    submissionText: text("submission_text"), // Text content of the submission
    filesUrls: text("files_urls"), // JSON array of file URLs
    codeSnippets: text("code_snippets"), // JSON array of code submissions
    submittedAt: timestamp("submitted_at").defaultNow(),
    status: text("status").default("submitted"), // submitted, reviewed, needs_revision, approved
    ...timestamps
}, (table) => ({
    homeworkIdIdx: index("homework_submissions_homework_id_idx").on(table.homeworkId),
    childIdIdx: index("homework_submissions_child_id_idx").on(table.childId)
}));

// Homework feedback and corrections
export const homeworkFeedbackTable = pgTable("homework_feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id").notNull().references(() => homeworkSubmissionsTable.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachersTable.id, { onDelete: 'cascade' }),
    grade: text("grade"), // A, B, C, D, F or numerical
    comments: text("comments").notNull(), // Teacher's comments
    mistakes: text("mistakes"), // JSON array of identified mistakes
    corrections: text("corrections"), // JSON array of corrections
    suggestions: text("suggestions"), // Suggestions for improvement
    reviewedAt: timestamp("reviewed_at").defaultNow(),
    ...timestamps
}, (table) => ({
    submissionIdIdx: index("homework_feedback_submission_id_idx").on(table.submissionId),
    teacherIdIdx: index("homework_feedback_teacher_id_idx").on(table.teacherId)
}));

// Personal goals for each child
export const childGoalsTable = pgTable("child_goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachersTable.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetDate: timestamp("target_date"),
    priority: text("priority").default("medium"), // low, medium, high
    status: text("status").default("active"), // active, completed, paused, cancelled
    progressPercentage: integer("progress_percentage").default(0),
    notes: text("notes"), // Progress notes
    ...timestamps
}, (table) => ({
    childIdIdx: index("child_goals_child_id_idx").on(table.childId),
    teacherIdIdx: index("child_goals_teacher_id_idx").on(table.teacherId),
    statusIdx: index("child_goals_status_idx").on(table.status)
}));

// Messages between parents and teachers
export const messagesTable = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id").notNull(), // Can be parent or teacher ID
    senderType: text("sender_type").notNull(), // "parent" or "teacher"
    receiverId: uuid("receiver_id").notNull(), // Can be parent or teacher ID
    receiverType: text("receiver_type").notNull(), // "parent" or "teacher"
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }), // Context of the message
    subject: text("subject"),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    priority: text("priority").default("normal"), // low, normal, high, urgent
    ...timestamps
}, (table) => ({
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
    receiverIdIdx: index("messages_receiver_id_idx").on(table.receiverId),
    childIdIdx: index("messages_child_id_idx").on(table.childId),
    isReadIdx: index("messages_is_read_idx").on(table.isRead)
}));

// Child portfolio - projects, websites, games, etc.
export const portfolioItemsTable = pgTable("portfolio_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").references(() => teachersTable.id, { onDelete: 'cascade' }), // Teacher who helped/supervised
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").notNull(), // "website", "game", "app", "script", "project"
    technologies: text("technologies"), // JSON array of technologies used
    projectUrl: text("project_url"), // Link to live project
    repositoryUrl: text("repository_url"), // Git repository link
    filesUrls: text("files_urls"), // JSON array of project files
    screenshots: text("screenshots"), // JSON array of screenshot URLs
    status: text("status").default("in_progress"), // in_progress, completed, archived
    completedAt: timestamp("completed_at"),
    isPublic: boolean("is_public").default(false), // Visible to other parents/children
    tags: text("tags"), // JSON array of tags for categorization
    ...timestamps
}, (table) => ({
    childIdIdx: index("portfolio_items_child_id_idx").on(table.childId),
    teacherIdIdx: index("portfolio_items_teacher_id_idx").on(table.teacherId),
    typeIdx: index("portfolio_items_type_idx").on(table.type),
    statusIdx: index("portfolio_items_status_idx").on(table.status)
}));

// Teacher-Child assignments (many-to-many relationship)
export const teacherChildAssignmentsTable = pgTable("teacher_child_assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id").notNull().references(() => teachersTable.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
    isPrimary: boolean("is_primary").default(false), // Primary teacher for the child
    subjects: text("subjects"), // JSON array of subjects this teacher teaches to this child
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").default(true),
    ...timestamps
}, (table) => ({
    teacherIdIdx: index("teacher_child_assignments_teacher_id_idx").on(table.teacherId),
    childIdIdx: index("teacher_child_assignments_child_id_idx").on(table.childId),
    isPrimaryIdx: index("teacher_child_assignments_is_primary_idx").on(table.isPrimary)
}));

// Relations
export const teachersRelations = relations(teachersTable, ({ many }) => ({
    lessons: many(lessonsTable),
    homework: many(homeworkTable),
    childGoals: many(childGoalsTable),
    homeworkFeedback: many(homeworkFeedbackTable),
    portfolioItems: many(portfolioItemsTable),
    teacherChildAssignments: many(teacherChildAssignmentsTable),
}));

export const parentsRelations = relations(parentsTable, ({ many }) => ({
    children: many(childrenTable),
    emailVerifications: many(emailVerificationsTable),
}));

export const childrenRelations = relations(childrenTable, ({ one, many }) => ({
    parent: one(parentsTable, {
        fields: [childrenTable.parentId],
        references: [parentsTable.id],
    }),
    primaryTeacher: one(teachersTable, {
        fields: [childrenTable.primaryTeacherId],
        references: [teachersTable.id],
    }),
    lessons: many(lessonsTable),
    homework: many(homeworkTable),
    homeworkSubmissions: many(homeworkSubmissionsTable),
    childGoals: many(childGoalsTable),
    portfolioItems: many(portfolioItemsTable),
    teacherChildAssignments: many(teacherChildAssignmentsTable),
}));

export const lessonsRelations = relations(lessonsTable, ({ one, many }) => ({
    teacher: one(teachersTable, {
        fields: [lessonsTable.teacherId],
        references: [teachersTable.id],
    }),
    child: one(childrenTable, {
        fields: [lessonsTable.childId],
        references: [childrenTable.id],
    }),
    homework: many(homeworkTable),
    lessonSummary: one(lessonSummariesTable),
}));

export const lessonSummariesRelations = relations(lessonSummariesTable, ({ one }) => ({
    lesson: one(lessonsTable, {
        fields: [lessonSummariesTable.lessonId],
        references: [lessonsTable.id],
    }),
}));

export const homeworkRelations = relations(homeworkTable, ({ one, many }) => ({
    lesson: one(lessonsTable, {
        fields: [homeworkTable.lessonId],
        references: [lessonsTable.id],
    }),
    child: one(childrenTable, {
        fields: [homeworkTable.childId],
        references: [childrenTable.id],
    }),
    teacher: one(teachersTable, {
        fields: [homeworkTable.teacherId],
        references: [teachersTable.id],
    }),
    submissions: many(homeworkSubmissionsTable),
}));

export const homeworkSubmissionsRelations = relations(homeworkSubmissionsTable, ({ one, many }) => ({
    homework: one(homeworkTable, {
        fields: [homeworkSubmissionsTable.homeworkId],
        references: [homeworkTable.id],
    }),
    child: one(childrenTable, {
        fields: [homeworkSubmissionsTable.childId],
        references: [childrenTable.id],
    }),
    feedback: many(homeworkFeedbackTable),
}));

export const homeworkFeedbackRelations = relations(homeworkFeedbackTable, ({ one }) => ({
    submission: one(homeworkSubmissionsTable, {
        fields: [homeworkFeedbackTable.submissionId],
        references: [homeworkSubmissionsTable.id],
    }),
    teacher: one(teachersTable, {
        fields: [homeworkFeedbackTable.teacherId],
        references: [teachersTable.id],
    }),
}));

export const childGoalsRelations = relations(childGoalsTable, ({ one }) => ({
    child: one(childrenTable, {
        fields: [childGoalsTable.childId],
        references: [childrenTable.id],
    }),
    teacher: one(teachersTable, {
        fields: [childGoalsTable.teacherId],
        references: [teachersTable.id],
    }),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
    child: one(childrenTable, {
        fields: [messagesTable.childId],
        references: [childrenTable.id],
    }),
}));

export const portfolioItemsRelations = relations(portfolioItemsTable, ({ one }) => ({
    child: one(childrenTable, {
        fields: [portfolioItemsTable.childId],
        references: [childrenTable.id],
    }),
    teacher: one(teachersTable, {
        fields: [portfolioItemsTable.teacherId],
        references: [teachersTable.id],
    }),
}));

export const teacherChildAssignmentsRelations = relations(teacherChildAssignmentsTable, ({ one }) => ({
    teacher: one(teachersTable, {
        fields: [teacherChildAssignmentsTable.teacherId],
        references: [teachersTable.id],
    }),
    child: one(childrenTable, {
        fields: [teacherChildAssignmentsTable.childId],
        references: [childrenTable.id],
    }),
}));

export const emailVerificationsRelations = relations(emailVerificationsTable, ({ one }) => ({
    parent: one(parentsTable, {
        fields: [emailVerificationsTable.parentId],
        references: [parentsTable.id],
    }),
}));