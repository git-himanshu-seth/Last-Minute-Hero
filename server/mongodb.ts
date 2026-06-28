import { MongoClient, Db } from 'mongodb';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'lifesaver_ai';

/**
 * Automatically URL-encodes the password and username in a MongoDB connection string
 * if they contain unencoded '@' or other special characters. This avoids parse errors
 * such as 'querySrv ENOTFOUND _mongodb._tcp.<password_segment>'.
 */
function getProcessedUri(uri: string): string {
  if (!uri) return uri;
  try {
    const protocolMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (!protocolMatch) return uri;
    const protocol = protocolMatch[1];
    const rest = protocolMatch[2];
    
    // Find the last '@' which separates credentials from host
    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex === -1) return uri;
    
    const credentials = rest.substring(0, lastAtIndex);
    const hostAndRest = rest.substring(lastAtIndex + 1);
    
    // Split credentials into username and password
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) return uri; // no password
    
    const username = credentials.substring(0, colonIndex);
    const password = credentials.substring(colonIndex + 1);
    
    // If the password contains a literal '@', it must be encoded to '%40'
    if (password.includes('@')) {
      const decodedPassword = decodeURIComponent(password);
      const encodedPassword = encodeURIComponent(decodedPassword);
      const decodedUsername = decodeURIComponent(username);
      const encodedUsername = encodeURIComponent(decodedUsername);
      const correctedUri = `${protocol}${encodedUsername}:${encodedPassword}@${hostAndRest}`;
      console.log('Automatically corrected MONGODB_URI to URL-encode password/username.');
      return correctedUri;
    }
  } catch (err) {
    console.error('Error auto-correcting MongoDB URI:', err);
  }
  return uri;
}

export interface MongoStatus {
  connected: boolean;
  usingFallback: boolean;
  uriProvided: boolean;
  dbName: string;
  error?: string;
  outboundIp?: string;
  collections?: {
    users: number;
    tasks: number;
    goals: number;
    habits: number;
  };
}

/**
 * Lazy initialization of the MongoDB client to prevent crashing on startup.
 */
export async function getMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined. Please add it in your .env or AI Studio Secrets panel.');
  }

  if (mongoClient && mongoDb) {
    return { client: mongoClient, db: mongoDb };
  }

  try {
    const processedUri = getProcessedUri(MONGODB_URI);
    mongoClient = new MongoClient(processedUri, {
      connectTimeoutMS: 2000,
      socketTimeoutMS: 2000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(DB_NAME);
    console.log(`Successfully connected to MongoDB database: ${DB_NAME}`);
    return { client: mongoClient, db: mongoDb };
  } catch (error: any) {
    mongoClient = null;
    mongoDb = null;
    console.log('MongoDB is not available. System is operating in default offline mode.');
    throw new Error('MongoDB Connection Offline');
  }
}

async function getOutboundIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const data: any = await res.json();
      return data.ip || 'Unavailable';
    }
  } catch (err) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('https://icanhazip.com', { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const text = await res.text();
        return text.trim() || 'Unavailable';
      }
    } catch {
      // ignore
    }
  }
  return 'Unavailable';
}

/**
 * Retrieves the connection status and document counts for monitoring.
 */
export async function checkMongoStatus(): Promise<MongoStatus> {
  const outboundIp = await getOutboundIp();

  if (!MONGODB_URI) {
    return {
      connected: false,
      usingFallback: true,
      uriProvided: false,
      dbName: DB_NAME,
      outboundIp,
      error: 'MONGODB_URI environment variable is missing.'
    };
  }

  try {
    const { db } = await getMongoDB();
    
    // Fetch count from collections
    const collections = ['users', 'tasks', 'goals', 'habits'];
    const counts: Record<string, number> = {};
    
    for (const colName of collections) {
      try {
        counts[colName] = await db.collection(colName).countDocuments();
      } catch {
        counts[colName] = 0;
      }
    }

    return {
      connected: true,
      usingFallback: false,
      uriProvided: true,
      dbName: DB_NAME,
      outboundIp,
      collections: {
        users: counts.users || 0,
        tasks: counts.tasks || 0,
        goals: counts.goals || 0,
        habits: counts.habits || 0,
      }
    };
  } catch (err: any) {
    return {
      connected: false,
      usingFallback: true,
      uriProvided: true,
      dbName: DB_NAME,
      outboundIp,
      error: err.message || 'Connection error'
    };
  }
}

/**
 * Synchronizes user profile to MongoDB.
 */
export async function syncUserProfileToMongo(userId: string, profileData: any) {
  try {
    const { db } = await getMongoDB();
    await db.collection('users').updateOne(
      { id: userId },
      { $set: { ...profileData, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped user profile update.');
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user tasks to MongoDB.
 */
export async function syncTaskToMongo(userId: string, task: any) {
  try {
    const { db } = await getMongoDB();
    await db.collection('tasks').updateOne(
      { id: task.id },
      { $set: { ...task, userId, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped task update.');
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user goals to MongoDB.
 */
export async function syncGoalToMongo(userId: string, goal: any) {
  try {
    const { db } = await getMongoDB();
    await db.collection('goals').updateOne(
      { id: goal.id },
      { $set: { ...goal, userId, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped goal update.');
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes user habits to MongoDB.
 */
export async function syncHabitToMongo(userId: string, habit: any) {
  try {
    const { db } = await getMongoDB();
    await db.collection('habits').updateOne(
      { id: habit.id },
      { $set: { ...habit, userId, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped habit update.');
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an item from MongoDB.
 */
export async function deleteFromMongo(collectionName: string, id: string) {
  try {
    const { db } = await getMongoDB();
    await db.collection(collectionName).deleteOne({ id });
    return { success: true };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped item deletion.');
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves all data of a specific user from MongoDB (for data recovery/loading).
 */
export async function fetchAllUserDataFromMongo(userId: string) {
  try {
    const { db } = await getMongoDB();
    const profile = await db.collection('users').findOne({ id: userId });
    const tasks = await db.collection('tasks').find({ userId }).toArray();
    const goals = await db.collection('goals').find({ userId }).toArray();
    const habits = await db.collection('habits').find({ userId }).toArray();

    return {
      success: true,
      profile,
      tasks: tasks.map(t => ({ ...t, _id: undefined })),
      goals: goals.map(g => ({ ...g, _id: undefined })),
      habits: habits.map(h => ({ ...h, _id: undefined }))
    };
  } catch (err: any) {
    console.log('MongoDB sync status: skipped fetching all user data.');
    return { success: false, error: err.message };
  }
}
