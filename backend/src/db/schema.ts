import { integer, text, real, index, boolean, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}

// Teachers table
export const teachers = pgTable("teachers", {
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

export const teachersSelectSchema = createSelectSchema(teachers).omit({
    passwordHash: true,
})
export const teachersInsertSchema = createInsertSchema(teachers)
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
export const parents = pgTable("parents", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    ...timestamps
});

export const parentsSelectSchema = createSelectSchema(parents)
    .omit({
        passwordHash: true,
    })
export const parentsInsertSchema = createInsertSchema(parents)
    .merge(z.object({
        password: z.string().min(6, "Password must be at least 6 characters long")
    }))
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
    })

// Children/Students table
export const children = pgTable("children", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    age: integer("age").notNull(),
    parentId: uuid("parent_id").notNull().references(() => parents.id, { onDelete: 'cascade' }),
    primaryTeacherId: uuid("primary_teacher_id").references(() => teachers.id, { onDelete: 'cascade' }),
    programmingLevel: text("programming_level").default("beginner"), // beginner, intermediate, advanced
    notes: text("notes"), // General notes about the child
    isActive: boolean("is_active").default(true),
    ...timestamps
}, (table) => ({
    parentIdIdx: index("children_parent_id_idx").on(table.parentId),
    teacherIdIdx: index("children_teacher_id_idx").on(table.primaryTeacherId)
}));

export const childrenSelectSchema = createSelectSchema(children);

// Lessons table
export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
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
export const lessonSummaries = pgTable("lesson_summaries", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").unique().notNull().references(() => lessons.id, { onDelete: 'cascade' }),
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
export const homework = pgTable("homework", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
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
export const homeworkSubmissions = pgTable("homework_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    homeworkId: uuid("homework_id").notNull().references(() => homework.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
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
export const homeworkFeedback = pgTable("homework_feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id").notNull().references(() => homeworkSubmissions.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
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
export const childGoals = pgTable("child_goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
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
export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id").notNull(), // Can be parent or teacher ID
    senderType: text("sender_type").notNull(), // "parent" or "teacher"
    receiverId: uuid("receiver_id").notNull(), // Can be parent or teacher ID
    receiverType: text("receiver_type").notNull(), // "parent" or "teacher"
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }), // Context of the message
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
export const portfolioItems = pgTable("portfolio_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
    teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: 'cascade' }), // Teacher who helped/supervised
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
export const teacherChildAssignments = pgTable("teacher_child_assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    childId: uuid("child_id").notNull().references(() => children.id, { onDelete: 'cascade' }),
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
export const teachersRelations = relations(teachers, ({ many }) => ({
    lessons: many(lessons),
    homework: many(homework),
    childGoals: many(childGoals),
    homeworkFeedback: many(homeworkFeedback),
    portfolioItems: many(portfolioItems),
    teacherChildAssignments: many(teacherChildAssignments),
}));

export const parentsRelations = relations(parents, ({ many }) => ({
    children: many(children),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
    parent: one(parents, {
        fields: [children.parentId],
        references: [parents.id],
    }),
    primaryTeacher: one(teachers, {
        fields: [children.primaryTeacherId],
        references: [teachers.id],
    }),
    lessons: many(lessons),
    homework: many(homework),
    homeworkSubmissions: many(homeworkSubmissions),
    childGoals: many(childGoals),
    portfolioItems: many(portfolioItems),
    teacherChildAssignments: many(teacherChildAssignments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    teacher: one(teachers, {
        fields: [lessons.teacherId],
        references: [teachers.id],
    }),
    child: one(children, {
        fields: [lessons.childId],
        references: [children.id],
    }),
    homework: many(homework),
    lessonSummary: one(lessonSummaries),
}));

export const lessonSummariesRelations = relations(lessonSummaries, ({ one }) => ({
    lesson: one(lessons, {
        fields: [lessonSummaries.lessonId],
        references: [lessons.id],
    }),
}));

export const homeworkRelations = relations(homework, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [homework.lessonId],
        references: [lessons.id],
    }),
    child: one(children, {
        fields: [homework.childId],
        references: [children.id],
    }),
    teacher: one(teachers, {
        fields: [homework.teacherId],
        references: [teachers.id],
    }),
    submissions: many(homeworkSubmissions),
}));

export const homeworkSubmissionsRelations = relations(homeworkSubmissions, ({ one, many }) => ({
    homework: one(homework, {
        fields: [homeworkSubmissions.homeworkId],
        references: [homework.id],
    }),
    child: one(children, {
        fields: [homeworkSubmissions.childId],
        references: [children.id],
    }),
    feedback: many(homeworkFeedback),
}));

export const homeworkFeedbackRelations = relations(homeworkFeedback, ({ one }) => ({
    submission: one(homeworkSubmissions, {
        fields: [homeworkFeedback.submissionId],
        references: [homeworkSubmissions.id],
    }),
    teacher: one(teachers, {
        fields: [homeworkFeedback.teacherId],
        references: [teachers.id],
    }),
}));

export const childGoalsRelations = relations(childGoals, ({ one }) => ({
    child: one(children, {
        fields: [childGoals.childId],
        references: [children.id],
    }),
    teacher: one(teachers, {
        fields: [childGoals.teacherId],
        references: [teachers.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    child: one(children, {
        fields: [messages.childId],
        references: [children.id],
    }),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
    child: one(children, {
        fields: [portfolioItems.childId],
        references: [children.id],
    }),
    teacher: one(teachers, {
        fields: [portfolioItems.teacherId],
        references: [teachers.id],
    }),
}));

export const teacherChildAssignmentsRelations = relations(teacherChildAssignments, ({ one }) => ({
    teacher: one(teachers, {
        fields: [teacherChildAssignments.teacherId],
        references: [teachers.id],
    }),
    child: one(children, {
        fields: [teacherChildAssignments.childId],
        references: [children.id],
    }),
}));