import { Task, Goal, Habit, DailyPlan, ProductivityReport, AppNotification, Badge, StrategyPlan } from '../types';

export const ALL_MOCK_BADGES: Badge[] = [
  {
    id: 'first-responder',
    name: 'First Responder',
    description: 'Created a critical/high urgency task and faced it head-on.',
    icon: 'ShieldAlert',
    category: 'rescue'
  },
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Completed a task 12+ hours before the deadline.',
    icon: 'Zap',
    category: 'speed'
  },
  {
    id: 'rescue-survivor',
    name: 'Rescue Survivor',
    description: 'Successfully completed an active, high-risk Rescue Mode task.',
    icon: 'HeartPulse',
    category: 'rescue'
  },
  {
    id: 'habit-champion',
    name: 'Habit Champion',
    description: 'Maintained a 5+ day streak on a focus routine.',
    icon: 'Flame',
    category: 'focus'
  },
  {
    id: 'procrastination-breaker',
    name: 'Procrastination Breaker',
    description: 'Conquered delay by completing a postponed task with the Emergency Engine.',
    icon: 'BrainCircuit',
    category: 'focus'
  },
  {
    id: 'syllabus-slayer',
    name: 'Syllabus Slayer',
    description: 'Extracted high-priority tasks from an uploaded syllabus/bill.',
    icon: 'FileCode',
    category: 'accuracy'
  },
  {
    id: 'team-hero',
    name: 'Team Lifesaver',
    description: 'Shared workload with a teammate during a critical group sprint.',
    icon: 'Users',
    category: 'team'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'demo-user',
    title: 'MERN Stack Job Application Project',
    description: 'Build a production-grade project including user roles, state management, and robust deployment instructions.',
    priority: 'critical',
    category: 'career',
    status: 'pending',
    deadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 days from now
    estimatedHours: 12,
    completedHours: 2,
    urgency: 9,
    impact: 10,
    userImportance: 9,
    riskLevel: 'critical',
    riskScore: 0.83, // Remaining Work (10h) / Remaining Time (36h) = 0.27, wait, let's make it highly urgent
    subtasks: [
      { id: 'sub-1', title: 'Design database model diagrams', completed: true },
      { id: 'sub-2', title: 'Implement Auth and JWT controllers', completed: true },
      { id: 'sub-3', title: 'Develop frontend dashboard with Tailwind CSS', completed: false },
      { id: 'sub-4', title: 'Integrate Stripe Payment mockup', completed: false },
      { id: 'sub-5', title: 'Deploy on Google Cloud Run', completed: false },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    rescuePlan: {
      today: [
        "Complete Tailwind dashboard component (Est: 3h)",
        "Write Stripe Payment mock service (Est: 2h)"
      ],
      tomorrow: [
        "Integrate frontend components with backend API (Est: 3h)",
        "Run end-to-end integration tests (Est: 2h)"
      ],
      dayAfter: [
        "Configure Cloud Run build triggers and deploy live (Est: 2h)"
      ],
      explanation: "We are compressing a 10-hour workload into 3 manageable daily sprints. By blocking out non-essential work, you will complete the core submission 8 hours before the deadline."
    },
    procrastinationAnalysis: {
      postponedCount: 4,
      rootCause: "Overwhelmed by the size of the project (12 hours) and خوف from Auth system configuration.",
      recommendation: "Bypass full login complexity today. Focus exclusively on the Tailwind dashboard mock layout. Spend just 15 minutes drafting the UI skeleton to break the paralysis."
    }
  },
  {
    id: 'task-2',
    userId: 'demo-user',
    title: 'DBMS Assignment 4: Query Optimization',
    description: 'Optimize complex nested queries, explain query execution plans, and write relational algebra.',
    priority: 'high',
    category: 'academic',
    status: 'pending',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    estimatedHours: 6,
    completedHours: 1,
    urgency: 7,
    impact: 8,
    userImportance: 8,
    riskLevel: 'moderate',
    riskScore: 0.45,
    subtasks: [
      { id: 'sub-db-1', title: 'Read Chapter 14: Query Processing', completed: true },
      { id: 'sub-db-2', title: 'Draft relational algebra expressions', completed: false },
      { id: 'sub-db-3', title: 'Solve the query indexing questions', completed: false }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-3',
    userId: 'demo-user',
    title: 'Pay Gas and Electricity Bills',
    description: 'Settle monthly utility bills to prevent service disruption or late fees.',
    priority: 'medium',
    category: 'financial',
    status: 'pending',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    estimatedHours: 0.5,
    completedHours: 0,
    urgency: 4,
    impact: 6,
    userImportance: 7,
    riskLevel: 'safe',
    riskScore: 0.1,
    subtasks: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-4',
    userId: 'demo-user',
    title: 'Configure Firebase Cloud Messaging',
    description: 'Add push tokens and cloud functions to handle reminders.',
    priority: 'low',
    category: 'career',
    status: 'completed',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4,
    completedHours: 4,
    urgency: 3,
    impact: 5,
    userImportance: 4,
    riskLevel: 'safe',
    riskScore: 0.0,
    subtasks: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: 'demo-user',
    title: 'Land a Senior Full Stack Engineer Role',
    type: 'career',
    targetDate: '2026-09-01',
    progress: 65,
    createdAt: '2026-01-01'
  },
  {
    id: 'goal-2',
    userId: 'demo-user',
    title: 'Secure Straight A\'s in Semester 6',
    type: 'academic',
    targetDate: '2026-07-15',
    progress: 80,
    createdAt: '2026-02-01'
  },
  {
    id: 'goal-3',
    userId: 'demo-user',
    title: 'Build a $5,000 Emergency Safety Fund',
    type: 'financial',
    targetDate: '2026-12-31',
    progress: 40,
    createdAt: '2026-01-15'
  }
];

export const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    userId: 'demo-user',
    title: 'Write code for 1 hour',
    streak: 8,
    consistencyScore: 92,
    completions: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'habit-2',
    userId: 'demo-user',
    title: 'Meditation & Focus Breathwork (15m)',
    streak: 3,
    consistencyScore: 78,
    completions: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockDailyPlans: DailyPlan[] = [
  {
    id: new Date().toISOString().split('T')[0],
    userId: 'demo-user',
    date: new Date().toISOString().split('T')[0],
    tasks: [
      { time: "08:00 AM", taskTitle: "Focus Meditation & Morning Coding Routine", durationHours: 1 },
      { time: "09:30 AM", taskTitle: "React/Tailwind Applet UI Implementation", durationHours: 2.5 },
      { time: "01:00 PM", taskTitle: "Review DBMS Assignment Queries", durationHours: 1.5 },
      { time: "03:00 PM", taskTitle: "MERN Backend Auth Troubleshooting", durationHours: 2 },
      { time: "06:00 PM", taskTitle: "Accountability Sync with AI Coach", durationHours: 0.5 },
    ],
    focusHours: 7,
    createdAt: new Date().toISOString()
  }
];

export const mockReport: ProductivityReport = {
  id: 'report-1',
  userId: 'demo-user',
  score: 84,
  strengths: [
    "Phenomenal daily habit consistency for coding (92% consistency score)",
    "High early-morning focus output before 10:00 AM"
  ],
  weaknesses: [
    "Postpones complex project milestones requiring > 5 contiguous hours",
    "Prone to academic procrastination on DBMS math proofs"
  ],
  suggestions: [
    "Keep setting micro-tasks (under 30 minutes) on tough database questions.",
    "Schedule your most complex coding tasks strictly during your prime focus slot (08:30 AM - 10:30 AM)."
  ],
  generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
};

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'demo-user',
    message: "🚨 DEADLINE ALERT: 'MERN Stack Job Application Project' is due in 36 hours. Click to activate Rescue Mode!",
    type: 'rescue',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'demo-user',
    message: "💡 COACH SUGGESTION: Break down DBMS Assignment 4 today to avoid a late-night rush.",
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

export const mockStrategyPlans: StrategyPlan[] = [
  {
    id: 'plan-1',
    userId: 'demo-user',
    name: 'Q3 Development Strategy',
    nodes: [
      { id: 'n1', position: { x: 250, y: 0 }, type: 'task', data: { label: 'Initial Strategy', category: 'General', hours: 2 } },
      { id: 'n2', position: { x: 250, y: 150 }, type: 'step', data: { label: 'Market Research' } }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
