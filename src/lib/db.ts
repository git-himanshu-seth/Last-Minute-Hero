import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Task, Goal, Habit, DailyPlan, ProductivityReport, AppNotification } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// USER SYNC
// ==========================================
function cleanUndefined(obj: any) {
  const clean: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
}

export async function saveUserProfile(userId: string, data: { id?: string; name: string; email: string; photoUrl?: string; productivityScore: number; [key: string]: any }) {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const cleanedData = cleanUndefined(data);
    await setDoc(userDocRef, {
      id: userId,
      ...cleanedData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string) {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// TASKS OPERATIONS
// ==========================================
export function subscribeTasks(userId: string, callback: (tasks: Task[]) => void) {
  const path = 'tasks';
  const q = query(
    collection(db, 'tasks'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    callback(tasks);
  }, (error) => {
    console.error("Error subscribing to tasks:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveTask(task: Omit<Task, 'id'> & { id?: string }) {
  const path = 'tasks';
  try {
    const colRef = collection(db, 'tasks');
    const docRef = task.id ? doc(colRef, task.id) : doc(colRef);
    const data = {
      ...task,
      id: docRef.id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, data, { merge: true });
    return data as Task;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTask(taskId: string) {
  const path = `tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// GOALS OPERATIONS
// ==========================================
export function subscribeGoals(userId: string, callback: (goals: Goal[]) => void) {
  const path = 'goals';
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const goals: Goal[] = [];
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() } as Goal);
    });
    callback(goals);
  }, (error) => {
    console.error("Error subscribing to goals:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveGoal(goal: Omit<Goal, 'id'> & { id?: string }) {
  const path = 'goals';
  try {
    const colRef = collection(db, 'goals');
    const docRef = goal.id ? doc(colRef, goal.id) : doc(colRef);
    const data = {
      ...goal,
      id: docRef.id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, data, { merge: true });
    return data as Goal;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGoal(goalId: string) {
  const path = `goals/${goalId}`;
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// HABITS OPERATIONS
// ==========================================
export function subscribeHabits(userId: string, callback: (habits: Habit[]) => void) {
  const path = 'habits';
  const q = query(
    collection(db, 'habits'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const habits: Habit[] = [];
    snapshot.forEach((doc) => {
      habits.push({ id: doc.id, ...doc.data() } as Habit);
    });
    callback(habits);
  }, (error) => {
    console.error("Error subscribing to habits:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveHabit(habit: Omit<Habit, 'id'> & { id?: string }) {
  const path = 'habits';
  try {
    const colRef = collection(db, 'habits');
    const docRef = habit.id ? doc(colRef, habit.id) : doc(colRef);
    const data = {
      ...habit,
      id: docRef.id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, data, { merge: true });
    return data as Habit;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHabit(habitId: string) {
  const path = `habits/${habitId}`;
  try {
    await deleteDoc(doc(db, 'habits', habitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// DAILY PLANS OPERATIONS
// ==========================================
export async function getDailyPlan(userId: string, date: string): Promise<DailyPlan | null> {
  const path = `dailyPlans/${userId}_${date}`;
  try {
    const docRef = doc(db, 'dailyPlans', `${userId}_${date}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyPlan;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveDailyPlan(plan: DailyPlan) {
  const path = `dailyPlans/${plan.userId}_${plan.date}`;
  try {
    const docRef = doc(db, 'dailyPlans', `${plan.userId}_${plan.date}`);
    await setDoc(docRef, plan, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// PRODUCTIVITY REPORTS
// ==========================================
export async function getLatestProductivityReport(userId: string): Promise<ProductivityReport | null> {
  const path = 'productivityReports';
  try {
    const q = query(
      collection(db, 'productivityReports'),
      where('userId', '==', userId),
      orderBy('generatedAt', 'desc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as ProductivityReport;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveProductivityReport(report: Omit<ProductivityReport, 'id'>) {
  const path = 'productivityReports';
  try {
    const docRef = doc(collection(db, 'productivityReports'));
    const data = {
      ...report,
      id: docRef.id
    };
    await setDoc(docRef, data);
    return data as ProductivityReport;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================
export function subscribeNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
  const path = 'notifications';
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const notifs: AppNotification[] = [];
    snapshot.forEach((doc) => {
      notifs.push({ id: doc.id, ...doc.data() } as AppNotification);
    });
    callback(notifs);
  }, (error) => {
    console.error("Error subscribing to notifications:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  const path = 'notifications';
  try {
    const docRef = doc(collection(db, 'notifications'));
    const data: AppNotification = {
      ...notif,
      id: docRef.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationAsRead(notifId: string) {
  const path = `notifications/${notifId}`;
  try {
    const docRef = doc(db, 'notifications', notifId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
