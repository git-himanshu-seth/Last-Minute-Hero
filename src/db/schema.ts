import { pgTable, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // maps to firebase userId/auth uid
  name: text('name').notNull(),
  email: text('email').notNull(),
  photoUrl: text('photo_url'),
  productivityScore: integer('productivity_score').default(0).notNull(),
  badges: jsonb('badges').default([]),
  reminders: jsonb('reminders'),
  habits: jsonb('habits'),
  createdAt: text('created_at').notNull(),
});

// Define the 'tasks' table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description').default('').notNull(),
  priority: text('priority').notNull(), // 'critical' | 'high' | 'medium' | 'low'
  category: text('category').notNull(),
  status: text('status').notNull(), // 'pending' | 'completed'
  deadline: text('deadline').notNull(),
  estimatedHours: integer('estimated_hours').default(0).notNull(),
  completedHours: integer('completed_hours').default(0).notNull(),
  urgency: integer('urgency').default(5).notNull(),
  impact: integer('impact').default(5).notNull(),
  userImportance: integer('user_importance').default(5).notNull(),
  riskLevel: text('risk_level').notNull(), // 'safe' | 'moderate' | 'high' | 'critical'
  riskScore: integer('risk_score').default(0).notNull(),
  subtasks: jsonb('subtasks').default([]),
  createdAt: text('created_at').notNull(),
  rescuePlan: jsonb('rescue_plan'),
  procrastinationAnalysis: jsonb('procrastination_analysis'),
});

// Define the 'goals' table
export const goals = pgTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'academic' | 'career' | 'financial' | 'fitness' | 'personal'
  targetDate: text('target_date').notNull(),
  progress: integer('progress').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// Define the 'habits' table
export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  streak: integer('streak').default(0).notNull(),
  consistencyScore: integer('consistency_score').default(0).notNull(),
  completions: jsonb('completions').default([]), // array of YYYY-MM-DD strings
  createdAt: text('created_at').notNull(),
});

// Define the 'daily_plans' table
export const dailyPlans = pgTable('daily_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  tasks: jsonb('tasks').default([]), // array of DailyPlanItem
  focusHours: integer('focus_hours').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// Define the 'productivity_reports' table
export const productivityReports = pgTable('productivity_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').default(0).notNull(),
  strengths: jsonb('strengths').default([]),
  weaknesses: jsonb('weaknesses').default([]),
  suggestions: jsonb('suggestions').default([]),
  generatedAt: text('generated_at').notNull(),
});

// Define the 'notifications' table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'alert' | 'info' | 'rescue'
  read: boolean('read').default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  goals: many(goals),
  habits: many(habits),
  dailyPlans: many(dailyPlans),
  productivityReports: many(productivityReports),
  notifications: many(notifications),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const habitsRelations = relations(habits, ({ one }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));

export const dailyPlansRelations = relations(dailyPlans, ({ one }) => ({
  user: one(users, {
    fields: [dailyPlans.userId],
    references: [users.id],
  }),
}));

export const productivityReportsRelations = relations(productivityReports, ({ one }) => ({
  user: one(users, {
    fields: [productivityReports.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
