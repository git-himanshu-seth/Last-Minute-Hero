export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  coverUrl?: string;
  productivityScore: number;
  createdAt: string;
  username?: string;
  password?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  country?: string;
  city?: string;
  timezone?: string;
  occupation?: string;
  organization?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  badges?: string[]; // IDs of unlocked badges
  reminders?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    phoneNumber?: string;
    priorHour: boolean; // prior 1 hour alerts
  };
  habits?: {
    preferredWorkHours?: string;
    focusPatterns?: string;
    completionTrends?: string;
  };
  productivityPrefs?: {
    wakeUpTime?: string;
    sleepTime?: string;
    workingHours?: string;
    studyHours?: string;
    breakInterval?: string;
    preferredMethod?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: 'speed' | 'accuracy' | 'focus' | 'rescue' | 'team';
  unlockedAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  status: 'pending' | 'completed';
  deadline: string; // ISO date string
  estimatedHours: number;
  completedHours: number;
  urgency: number; // 1 to 10
  impact: number; // 1 to 10
  userImportance: number; // 1 to 10
  riskLevel: 'safe' | 'moderate' | 'high' | 'critical';
  riskScore: number; // calculated ratio
  subtasks: SubTask[];
  createdAt: string;
  rescuePlan?: {
    today: string[];
    tomorrow: string[];
    dayAfter: string[];
    explanation: string;
  };
  procrastinationAnalysis?: {
    postponedCount: number;
    rootCause: string;
    recommendation: string;
  };
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'academic' | 'career' | 'financial' | 'fitness' | 'personal';
  targetDate: string;
  progress: number; // 0 to 100
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  streak: number;
  consistencyScore: number;
  completions: string[]; // array of YYYY-MM-DD strings
  createdAt: string;
}

export interface DailyPlanItem {
  time: string; // e.g. "08:00 AM"
  taskTitle: string;
  durationHours: number;
}

export interface DailyPlan {
  id: string; // date YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  tasks: DailyPlanItem[];
  focusHours: number;
  createdAt: string;
}

export interface ProductivityReport {
  id: string;
  userId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  generatedAt: string;
}

export interface StrategyPlan {
  id: string;
  userId: string;
  name: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: 'alert' | 'info' | 'rescue';
  read: boolean;
  createdAt: string;
}
