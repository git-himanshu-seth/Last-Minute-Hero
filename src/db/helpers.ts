import { eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { users, tasks, goals, habits, dailyPlans, productivityReports, notifications } from './schema.ts';

export interface CloudSqlStatus {
  connected: boolean;
  dbName: string;
  error?: string;
  collections?: {
    users: number;
    tasks: number;
    goals: number;
    habits: number;
  };
}

/**
 * Checks Cloud SQL database status and retrieves record counts.
 */
export async function checkCloudSqlStatus(): Promise<CloudSqlStatus> {
  try {
    // Perform a simple ping query to test connectivity
    await db.execute(sql`SELECT 1`);

    // Get table counts
    const usersCountResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const tasksCountResult = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const goalsCountResult = await db.select({ count: sql<number>`count(*)` }).from(goals);
    const habitsCountResult = await db.select({ count: sql<number>`count(*)` }).from(habits);

    return {
      connected: true,
      dbName: process.env.SQL_DB_NAME || 'postgres',
      collections: {
        users: Number(usersCountResult[0]?.count || 0),
        tasks: Number(tasksCountResult[0]?.count || 0),
        goals: Number(goalsCountResult[0]?.count || 0),
        habits: Number(habitsCountResult[0]?.count || 0),
      }
    };
  } catch (error: any) {
    console.error('Cloud SQL status check failed:', error);
    return {
      connected: false,
      dbName: process.env.SQL_DB_NAME || 'postgres',
      error: error.message || 'Database connection error'
    };
  }
}

/**
 * Synchronizes user profile to Cloud SQL.
 */
export async function syncUserProfileToCloudSql(userId: string, profileData: any) {
  try {
    await db.insert(users)
      .values({
        id: userId,
        name: profileData.name || 'Anonymous User',
        email: profileData.email || '',
        photoUrl: profileData.photoUrl || null,
        productivityScore: profileData.productivityScore || 0,
        badges: profileData.badges || [],
        reminders: profileData.reminders || null,
        habits: profileData.habits || null,
        createdAt: profileData.createdAt || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: profileData.name || 'Anonymous User',
          email: profileData.email || '',
          photoUrl: profileData.photoUrl || null,
          productivityScore: profileData.productivityScore || 0,
          badges: profileData.badges || [],
          reminders: profileData.reminders || null,
          habits: profileData.habits || null,
        }
      });
    return { success: true };
  } catch (err: any) {
    console.error('Cloud SQL user sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user tasks to Cloud SQL.
 */
export async function syncTaskToCloudSql(userId: string, task: any) {
  try {
    // Ensure the user exists in users table before inserting task (foreign key constraint)
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userExists.length === 0) {
      // Create user placeholder
      await db.insert(users).values({
        id: userId,
        name: 'Sync User',
        email: 'sync@example.com',
        createdAt: new Date().toISOString(),
      });
    }

    await db.insert(tasks)
      .values({
        id: task.id,
        userId,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'personal',
        status: task.status || 'pending',
        deadline: task.deadline || new Date().toISOString(),
        estimatedHours: task.estimatedHours || 0,
        completedHours: task.completedHours || 0,
        urgency: task.urgency || 5,
        impact: task.impact || 5,
        userImportance: task.userImportance || 5,
        riskLevel: task.riskLevel || 'safe',
        riskScore: task.riskScore || 0,
        subtasks: task.subtasks || [],
        createdAt: task.createdAt || new Date().toISOString(),
        rescuePlan: task.rescuePlan || null,
        procrastinationAnalysis: task.procrastinationAnalysis || null,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'medium',
          category: task.category || 'personal',
          status: task.status || 'pending',
          deadline: task.deadline || new Date().toISOString(),
          estimatedHours: task.estimatedHours || 0,
          completedHours: task.completedHours || 0,
          urgency: task.urgency || 5,
          impact: task.impact || 5,
          userImportance: task.userImportance || 5,
          riskLevel: task.riskLevel || 'safe',
          riskScore: task.riskScore || 0,
          subtasks: task.subtasks || [],
          rescuePlan: task.rescuePlan || null,
          procrastinationAnalysis: task.procrastinationAnalysis || null,
        }
      });
    return { success: true };
  } catch (err: any) {
    console.error('Cloud SQL task sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user goals to Cloud SQL.
 */
export async function syncGoalToCloudSql(userId: string, goal: any) {
  try {
    await db.insert(goals)
      .values({
        id: goal.id,
        userId,
        title: goal.title,
        type: goal.type || 'personal',
        targetDate: goal.targetDate || new Date().toISOString(),
        progress: goal.progress || 0,
        createdAt: goal.createdAt || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: goals.id,
        set: {
          title: goal.title,
          type: goal.type || 'personal',
          targetDate: goal.targetDate || new Date().toISOString(),
          progress: goal.progress || 0,
        }
      });
    return { success: true };
  } catch (err: any) {
    console.error('Cloud SQL goal sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user habits to Cloud SQL.
 */
export async function syncHabitToCloudSql(userId: string, habit: any) {
  try {
    await db.insert(habits)
      .values({
        id: habit.id,
        userId,
        title: habit.title,
        streak: habit.streak || 0,
        consistencyScore: habit.consistencyScore || 0,
        completions: habit.completions || [],
        createdAt: habit.createdAt || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: habits.id,
        set: {
          title: habit.title,
          streak: habit.streak || 0,
          consistencyScore: habit.consistencyScore || 0,
          completions: habit.completions || [],
        }
      });
    return { success: true };
  } catch (err: any) {
    console.error('Cloud SQL habit sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an item from Cloud SQL.
 */
export async function deleteFromCloudSql(tableName: string, id: string) {
  try {
    if (tableName === 'tasks') {
      await db.delete(tasks).where(eq(tasks.id, id));
    } else if (tableName === 'goals') {
      await db.delete(goals).where(eq(goals.id, id));
    } else if (tableName === 'habits') {
      await db.delete(habits).where(eq(habits.id, id));
    } else {
      throw new Error(`Unsupported table: ${tableName}`);
    }
    return { success: true };
  } catch (err: any) {
    console.error(`Cloud SQL deletion error from table ${tableName}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves all data of a specific user from Cloud SQL (for recovery/loading).
 */
export async function fetchAllUserDataFromCloudSql(userId: string) {
  try {
    const profile = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
    const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));

    return {
      success: true,
      profile: profile[0] || null,
      tasks: userTasks,
      goals: userGoals,
      habits: userHabits,
    };
  } catch (err: any) {
    console.error('Cloud SQL fetch all user data failed:', err);
    return { success: false, error: err.message };
  }
}
