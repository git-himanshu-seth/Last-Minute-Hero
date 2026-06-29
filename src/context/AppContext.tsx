import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  saveUserProfile, 
  subscribeTasks, 
  subscribeGoals, 
  subscribeHabits, 
  subscribeNotifications, 
  saveTask, 
  deleteTask, 
  saveGoal, 
  deleteGoal, 
  saveHabit, 
  deleteHabit, 
  getDailyPlan, 
  saveDailyPlan, 
  getLatestProductivityReport, 
  saveProductivityReport, 
  createNotification, 
  markNotificationAsRead,
  subscribeStrategyPlans,
  saveStrategyPlan,
  deleteStrategyPlan
} from '../lib/db';
import { 
  mockTasks, 
  mockGoals, 
  mockHabits, 
  mockDailyPlans, 
  mockReport, 
  mockNotifications,
  mockStrategyPlans 
} from '../lib/mockData';
import { Task, Goal, Habit, DailyPlan, ProductivityReport, AppNotification, UserProfile, StrategyPlan } from '../types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextProps {
  user: UserProfile | null;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  dailyPlan: DailyPlan | null;
  report: ProductivityReport | null;
  notifications: AppNotification[];
  strategyPlans: StrategyPlan[];
  loading: boolean;
  isDemo: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startDemoMode: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  googleAccessToken: string | null;
  
  // Premium and AI quota
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  upgradeUserPlan: (plan: 'free' | 'pro' | 'enterprise') => Promise<void>;
  aiUsageCount: number;
  checkAiAccess: () => boolean;
  incrementAiUsage: () => void;
  fixGrammarWithAi: (text: string) => Promise<string>;
  
  // Custom Auth
  signUpWithCredentials: (name: string, email: string, username: string, password: string, photoUrl?: string) => Promise<void>;
  loginWithCredentials: (usernameOrEmail: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateReminderSettings: (settings: UserProfile['reminders']) => Promise<void>;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  simulateReminderAlert: (taskTitle: string, channel: 'email' | 'sms' | 'push') => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Tasks actions
  addTask: (text: string, imageBase64?: string) => Promise<Task>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  toggleSubtaskStatus: (taskId: string, subtaskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  updateTaskProgress: (taskId: string, hours: number) => Promise<void>;
  triggerDeadlineRescue: (taskId: string) => Promise<void>;
  triggerProcrastinationAnalysis: (taskId: string) => Promise<void>;
  triggerTaskBreakdown: (taskId: string) => Promise<void>;
  
  // Goals actions
  addGoal: (title: string, type: Goal['type'], targetDate: string) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
  
  // Habits actions
  addHabit: (title: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, dateStr: string) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  
  // Daily Plan actions
  generateTodayPlan: () => Promise<void>;
  
  // Coach actions
  generateProductivityReport: () => Promise<void>;
  
  // Read notification
  readNotification: (id: string) => Promise<void>;
  
  // Strategy Plans
  addStrategyPlan: (name: string, nodes: any[], edges: any[]) => Promise<StrategyPlan>;
  updateStrategyPlan: (plan: StrategyPlan) => Promise<void>;
  removeStrategyPlan: (planId: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [report, setReport] = useState<ProductivityReport | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [strategyPlans, setStrategyPlans] = useState<StrategyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Premium & Upgrade States
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    return Number(localStorage.getItem('lifesaver_ai_usage_count') || '0');
  });

  const checkAiAccess = (): boolean => {
    if (user?.plan === 'pro' || user?.plan === 'enterprise') {
      return true;
    }
    if (aiUsageCount >= 3) {
      showToast('AI quota exhausted! Upgrade to Pro to unlock unlimited AI suggestions, voice, and coach requests.', 'warning');
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const incrementAiUsage = () => {
    if (user?.plan === 'pro' || user?.plan === 'enterprise') return;
    const newCount = aiUsageCount + 1;
    setAiUsageCount(newCount);
    localStorage.setItem('lifesaver_ai_usage_count', String(newCount));
  };

  const upgradeUserPlan = async (selectedPlan: 'free' | 'pro' | 'enterprise') => {
    if (!user) {
      showToast('Please log in first to purchase a subscription.', 'warning');
      return;
    }
    try {
      const updatedProfile = { ...user, plan: selectedPlan };
      setUser(updatedProfile);
      
      if (!isDemo) {
        await saveUserProfile(user.id, updatedProfile);
      }
      
      showToast(`Successfully upgraded to the ${selectedPlan.toUpperCase()} plan! Thank you for your support!`, 'success');
      setShowUpgradeModal(false);
    } catch (err: any) {
      console.error('Failed to upgrade user plan:', err);
      showToast('Failed to update plan. Please try again.', 'error');
    }
  };

  const fixGrammarWithAi = async (textToFix: string): Promise<string> => {
    if (!textToFix.trim()) return '';
    if (!checkAiAccess()) {
      throw new Error('AI Limit Reached. Please upgrade.');
    }
    
    try {
      const response = await fetch('/api/gemini/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToFix })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to polish text');
      }
      
      const data = await response.json();
      incrementAiUsage();
      return data.correctedText;
    } catch (error: any) {
      console.error('Error fixing grammar with AI:', error);
      showToast(error.message || 'Grammar correction failed', 'error');
      throw error;
    }
  };


  // Toast Helpers
  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activate Demo Mode
  const startDemoMode = () => {
    setIsDemo(true);
    setFirebaseUser(null);
    setUser({
      id: 'demo-user',
      name: 'Alex Hustle (Demo Mode)',
      email: 'hustle.demo@ai-studio.app',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      productivityScore: 84,
      createdAt: new Date().toISOString(),
      badges: ['first-responder', 'habit-champion'],
      plan: 'free',
      reminders: {
        email: true,
        sms: false,
        push: true,
        priorHour: true
      }
    });
    setTasks(mockTasks);
    setGoals(mockGoals);
    setHabits(mockHabits);
    setDailyPlan(mockDailyPlans[0]);
    setReport(mockReport);
    setNotifications(mockNotifications);
    setStrategyPlans(mockStrategyPlans || []);
    setActiveTab('dashboard');
    setLoading(false);
  };

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    setIsDemo(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/tasks');
      provider.addScope('https://www.googleapis.com/auth/tasks.readonly');
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const u = result.user;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setGoogleAccessToken(credential.accessToken);
          showToast('Successfully authenticated Google Workspace APIs!', 'success');
        }
        
        const profile: UserProfile = {
          id: u.uid,
          name: u.displayName || 'Developer Partner',
          email: u.email || 'partner@gmail.com',
          photoUrl: u.photoURL || undefined,
          productivityScore: 75,
          createdAt: new Date().toISOString(),
          badges: ['first-responder'],
          reminders: {
            email: true,
            sms: false,
            push: true,
            priorHour: true
          }
        };
        await saveUserProfile(u.uid, profile);
        setUser(profile);
        setActiveTab('dashboard');
      }
    } catch (err) {
      if (err instanceof Error && 'code' in err && ((err as any).code === 'auth/cancelled-popup-request' || (err as any).code === 'auth/popup-closed-by-user')) {
        showToast('Authentication cancelled. Please try again.', 'info');
      } else {
        console.error("Google Auth Error:", err);
        showToast('Failed to sign in. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setIsDemo(false);
    setUser(null);
    setTasks([]);
    setGoals([]);
    setHabits([]);
    setDailyPlan(null);
    setReport(null);
    setNotifications([]);
    setGoogleAccessToken(null);
    setActiveTab('landing');
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        setFirebaseUser(fUser);
        setIsDemo(false);
        // Load user profile
        const userDocRef = doc(db, 'users', fUser.uid);
        const userSnap = await getDoc(userDocRef);
        let profile: UserProfile;
        if (userSnap.exists()) {
          const d = userSnap.data();
          profile = {
            id: fUser.uid,
            name: d.name || fUser.displayName || 'Developer Partner',
            email: d.email || fUser.email || 'partner@gmail.com',
            photoUrl: d.photoUrl || fUser.photoURL || undefined,
            productivityScore: d.productivityScore || 75,
            createdAt: d.createdAt || new Date().toISOString(),
            badges: d.badges || ['first-responder'],
            plan: d.plan || 'free',
            reminders: d.reminders || {
              email: true,
              sms: false,
              push: true,
              priorHour: true
            }
          };
        } else {
          profile = {
            id: fUser.uid,
            name: fUser.displayName || 'Developer Partner',
            email: fUser.email || 'partner@gmail.com',
            photoUrl: fUser.photoURL || undefined,
            productivityScore: 75,
            createdAt: new Date().toISOString(),
            badges: ['first-responder'],
            plan: 'free',
            reminders: {
              email: true,
              sms: false,
              push: true,
              priorHour: true
            }
          };
          await saveUserProfile(fUser.uid, profile);
        }
        setUser(profile);
        setActiveTab('dashboard');
      } else if (!isDemo) {
        setUser(null);
        setActiveTab('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isDemo]);

  // Firestore live subscriptions
  useEffect(() => {
    if (!user || isDemo) return;

    const unSubTasks = subscribeTasks(user.id, (loadedTasks) => {
      setTasks(loadedTasks);
    });

    const unSubGoals = subscribeGoals(user.id, (loadedGoals) => {
      setGoals(loadedGoals);
    });

    const unSubHabits = subscribeHabits(user.id, (loadedHabits) => {
      setHabits(loadedHabits);
    });

    const unSubNotifications = subscribeNotifications(user.id, (loadedNotifs) => {
      setNotifications(loadedNotifs);
    });

    const unSubPlans = subscribeStrategyPlans(user.id, (loadedPlans) => {
      setStrategyPlans(loadedPlans);
    });

    // Fetch daily plan
    const todayStr = new Date().toISOString().split('T')[0];
    getDailyPlan(user.id, todayStr).then((plan) => {
      setDailyPlan(plan);
    });

    // Fetch performance coach report
    getLatestProductivityReport(user.id).then((rep) => {
      setReport(rep);
    });

    return () => {
      unSubTasks();
      unSubGoals();
      unSubHabits();
      unSubNotifications();
      unSubPlans();
    };
  }, [user, isDemo]);

  // Utility to help Firestore vs Local State changes
  const updateLocalOrFirestore = async (
    collectionName: 'tasks' | 'goals' | 'habits',
    localSetter: React.Dispatch<React.SetStateAction<any[]>>,
    saveFn: (data: any) => Promise<any>,
    record: any
  ) => {
    if (isDemo) {
      localSetter((prev) => {
        const index = prev.findIndex((r) => r.id === record.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...record };
          return updated;
        } else {
          return [record, ...prev];
        }
      });
    } else {
      await saveFn(record);
    }
  };

  // ==========================================
  // CUSTOM CREDENTIALS AUTH & REMINDERS ACTIONS
  // ==========================================

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const validatePassword = (passStr: string) => {
    return passStr && passStr.length >= 6;
  };

  const signUpWithCredentials = async (name: string, email: string, username: string, password: string, photoUrl?: string) => {
    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      throw new Error('Please enter a valid email address.');
    }
    if (!password || !validatePassword(password)) {
      showToast('Password must be at least 6 characters long.', 'error');
      throw new Error('Password must be at least 6 characters long.');
    }
    if (!name || !name.trim()) {
      showToast('Username/name is required.', 'error');
      throw new Error('Username/name is required.');
    }

    setLoading(true);
    setIsDemo(false);
    try {
      await signOut(auth);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const fUser = credential.user;

      const profile: UserProfile = {
        id: fUser.uid,
        name: name,
        email: email,
        username: username || name,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        productivityScore: 75,
        createdAt: new Date().toISOString(),
        badges: ['first-responder'],
        reminders: {
          email: true,
          sms: false,
          push: true,
          priorHour: true
        }
      };
      
      await saveUserProfile(fUser.uid, profile);
      setUser(profile);
      setActiveTab('dashboard');
      showToast('Account created successfully! Welcome!', 'success');
      
      // Auto trigger first responder badge on register
      const msg = `🎉 Welcome to Success Scheduler, ${name}! Your credentials account has been successfully created.`;
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: fUser.uid,
        message: msg,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    } catch (err: any) {
      console.error("Credentials Sign Up Error:", err);
      let friendlyError = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email address is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = 'Email/Password sign-up is not enabled in your Firebase project. Please enable it in your Firebase Console.';
      }
      showToast(friendlyError, 'error');
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (usernameOrEmail: string, password: string) => {
    const email = usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@ai-studio.app`;
    
    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      throw new Error('Please enter a valid email address.');
    }
    if (!password) {
      showToast('Password is required.', 'error');
      throw new Error('Password is required.');
    }

    setLoading(true);
    setIsDemo(false);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fUser = credential.user;

      const userDocRef = doc(db, 'users', fUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const d = userSnap.data();
        const profile: UserProfile = {
          id: fUser.uid,
          name: d.name || 'Developer Partner',
          email: d.email || fUser.email || 'partner@gmail.com',
          photoUrl: d.photoUrl || fUser.photoURL || undefined,
          productivityScore: d.productivityScore || 75,
          createdAt: d.createdAt || new Date().toISOString(),
          badges: d.badges || ['first-responder'],
          reminders: d.reminders || {
            email: true,
            sms: false,
            push: true,
            priorHour: true
          }
        };
        setUser(profile);
      }
      setActiveTab('dashboard');
      showToast('Welcome back! Session started successfully.', 'success');
    } catch (err: any) {
      console.error("Credentials Login Error:", err);
      let friendlyError = err.message || 'Login failed. Please verify credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Incorrect email or password.';
      }
      showToast(friendlyError, 'error');
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      throw new Error('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent! Check your email inbox.', 'success');
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      let friendlyError = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        friendlyError = 'No user account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Invalid email address format.';
      }
      showToast(friendlyError, 'error');
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const updateReminderSettings = async (settings: UserProfile['reminders']) => {
    if (!user) return;
    const updatedUser = { ...user, reminders: settings };
    setUser(updatedUser);
    if (!isDemo) {
      await saveUserProfile(user.id, updatedUser);
    }
    
    const msg = `🔔 Alert Channels Synced: Email=${settings?.email ? 'ON' : 'OFF'}, SMS=${settings?.sms ? 'ON' : 'OFF'}, Push=${settings?.push ? 'ON' : 'OFF'}, 1-Hour Pre-alert=ON`;
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      message: msg,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileUpdates };
    setUser(updatedUser);
    if (!isDemo) {
      await saveUserProfile(user.id, updatedUser);
    }
    showToast('Your developer profile and preferences have been successfully synchronized!', 'success');
  };

  const unlockBadge = async (badgeId: string) => {
    if (!user) return;
    const currentBadges = user.badges || [];
    if (currentBadges.includes(badgeId)) return;
    
    const updatedBadges = [...currentBadges, badgeId];
    const updatedUser = { ...user, badges: updatedBadges };
    setUser(updatedUser);
    
    if (!isDemo) {
      await saveUserProfile(user.id, updatedUser);
    }

    const msg = `🏆 ACHIEVEMENT UNLOCKED: You earned the '${badgeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}' Badge! Check your stats.`;
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      message: msg,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const simulateReminderAlert = (taskTitle: string, channel: 'email' | 'sms' | 'push') => {
    if (!user) return;
    const channelLabel = channel.toUpperCase();
    const msg = `⏳ [1-HOUR PRIOR WARNING] Sent via ${channelLabel} Alert to ${channel === 'sms' ? (user.reminders?.phoneNumber || '+15550199') : user.email}: '${taskTitle}' is starting soon. Complete it before the deadline!`;
    
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      message: msg,
      type: 'rescue',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // ==========================================
  // CORE AI INTERACTIONS & DB TASKS ACTIONS
  // ==========================================
  
  const addTask = async (text: string, imageBase64?: string): Promise<Task> => {
    if (!user) throw new Error("Must be logged in to capture tasks");
    
    // Check total task limit of 5 for free tier
    const isPremium = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPremium && tasks.length >= 5) {
      setShowUpgradeModal(true);
      showToast("Task limit reached! Free accounts are limited to 5 tasks. Please upgrade to Pro or Enterprise.", "warning");
      throw new Error("Task limit reached. Please upgrade to a Premium plan to create more than 5 tasks.");
    }

    if (!checkAiAccess()) {
      throw new Error("AI capture quota exhausted. Please upgrade to Pro or Enterprise.");
    }

    // Call server API
    const response = await fetch('/api/gemini/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, imageBase64 })
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to capture task details');
    }
    
    const extracted = await response.json();
    
    const newTask: Omit<Task, 'id'> = {
      userId: user.id,
      title: extracted.title || text,
      description: extracted.description || '',
      priority: extracted.priority || 'medium',
      category: extracted.category || 'personal',
      status: 'pending',
      deadline: extracted.deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: extracted.estimatedHours || 2,
      completedHours: 0,
      urgency: extracted.urgency || 5,
      impact: extracted.impact || 5,
      userImportance: extracted.userImportance || 5,
      riskLevel: 'safe',
      riskScore: 0,
      subtasks: (extracted.subtasks || []).map((t: string, idx: number) => ({
        id: `sub-${idx}-${Date.now()}`,
        title: t,
        completed: false
      })),
      createdAt: new Date().toISOString()
    };

    // Calculate Risk Score & Level
    const remainingTimeHours = (new Date(newTask.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    const riskScore = remainingTimeHours > 0 ? (newTask.estimatedHours / remainingTimeHours) : 1.5;
    newTask.riskScore = Number(riskScore.toFixed(2));
    
    if (riskScore >= 0.75) newTask.riskLevel = 'critical';
    else if (riskScore >= 0.45) newTask.riskLevel = 'high';
    else if (riskScore >= 0.2) newTask.riskLevel = 'moderate';
    else newTask.riskLevel = 'safe';

    let saved: Task;
    if (isDemo) {
      saved = { ...newTask, id: `task-${Date.now()}` } as Task;
      setTasks((prev) => [saved, ...prev]);
    } else {
      saved = await saveTask(newTask);
    }

    // Auto trigger prioritization logic
    const priorityResponse = await fetch('/api/gemini/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: saved })
    });

    if (priorityResponse.ok) {
      const pData = await priorityResponse.json();
      saved.priority = pData.priorityLevel || saved.priority;
      saved.description = `${saved.description || ''}\n\n💡 AI Priority Analysis: ${pData.explanation || ''}`.trim();
      
      // Update the record
      if (isDemo) {
        setTasks((prev) => prev.map((t) => t.id === saved.id ? { ...t, ...saved } : t));
      } else {
        await saveTask(saved);
      }
    }

    // Trigger Notification if critical risk
    if (saved.riskLevel === 'critical' || saved.riskLevel === 'high') {
      const msg = `⚠️ Deadline Risk alert: '${saved.title}' is flagged as ${saved.riskLevel.toUpperCase()} RISK. Active Rescue Mode.`;
      if (isDemo) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: user.id,
          message: msg,
          type: 'rescue',
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications((prev) => [notif, ...prev]);
      } else {
        await createNotification({
          userId: user.id,
          message: msg,
          type: 'rescue'
        });
      }
    }

    incrementAiUsage();
    return saved;
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedStatus = task.status === 'pending' ? 'completed' : 'pending';
    const updated = { ...task, status: updatedStatus };
    
    // Adjust productivity score on complete
    if (updatedStatus === 'completed' && user) {
      const newScore = Math.min(user.productivityScore + 3, 100);
      
      // Calculate if completed on time (before deadline)
      const isOnTime = new Date().getTime() < new Date(task.deadline).getTime();
      const updatedBadges = [...(user.badges || [])];
      
      if (isOnTime && !updatedBadges.includes('speed-runner')) {
        updatedBadges.push('speed-runner');
      }
      
      if ((task.priority === 'critical' || task.riskLevel === 'critical' || task.priority === 'high') && !updatedBadges.includes('rescue-survivor')) {
        updatedBadges.push('rescue-survivor');
      }

      if (!updatedBadges.includes('task-finisher')) {
        updatedBadges.push('task-finisher');
      }
      
      const updatedUserProfile = { 
        ...user, 
        productivityScore: newScore,
        badges: updatedBadges
      };

      if (isDemo) {
        setUser(updatedUserProfile);
      } else {
        await saveUserProfile(user.id, updatedUserProfile);
      }

      // Add corresponding achievement notification alerts
      if (isOnTime && !user.badges?.includes('speed-runner')) {
        const notifMsg = `🏆 ACHIEVEMENT UNLOCKED: You earned the 'Speed Runner' Badge for completing '${task.title}' before the clock ran out!`;
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: user.id,
          message: notifMsg,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
      
      if (!user.badges?.includes('task-finisher')) {
        const notifMsg = `🏆 ACHIEVEMENT UNLOCKED: You earned the 'Task Finisher' Badge for completing '${task.title}'!`;
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: user.id,
          message: notifMsg,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }

    if (isDemo) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
    } else {
      await saveTask(updated);
    }
  };

  const toggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = task.subtasks.map((st) => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updated = { ...task, subtasks };

    if (isDemo) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
    } else {
      await saveTask(updated);
    }
  };

  const removeTask = async (taskId: string) => {
    if (isDemo) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      await deleteTask(taskId);
    }
  };

  const updateTaskProgress = async (taskId: string, hours: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = { ...task, completedHours: Math.min(task.completedHours + hours, task.estimatedHours) };

    if (isDemo) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
    } else {
      await saveTask(updated);
    }
  };

  const triggerDeadlineRescue = async (taskId: string) => {
    if (!checkAiAccess()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const response = await fetch('/api/gemini/rescue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task })
    });

    if (response.ok) {
      const rescuePlan = await response.json();
      const updated = { ...task, rescuePlan };
      
      if (isDemo) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
      } else {
        await saveTask(updated);
      }
      incrementAiUsage();
    } else {
      throw new Error("Rescue mode computation failed");
    }
  };

  const triggerProcrastinationAnalysis = async (taskId: string) => {
    if (!checkAiAccess()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const response = await fetch('/api/gemini/procrastinate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, postponedCount: 3 })
    });

    if (response.ok) {
      const analysis = await response.json();
      const updated = { 
        ...task, 
        procrastinationAnalysis: {
          postponedCount: 3,
          rootCause: analysis.rootCause,
          recommendation: analysis.recommendation
        },
        // We can append the Time Machine prediction to description or a direct attribute
        description: `${task.description || ''}\n\n🔮 AI Time Machine: ${analysis.prediction}`.trim()
      };

      if (isDemo) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
      } else {
        await saveTask(updated);
      }
      incrementAiUsage();
    }
  };

  const triggerTaskBreakdown = async (taskId: string) => {
    if (!checkAiAccess()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Simulate breakdown into subtasks by calling the rescue planner or adding subtasks
    const response = await fetch('/api/gemini/rescue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task })
    });

    if (response.ok) {
      const breakdown = await response.json();
      // Compile milestones into subtasks
      const steps = [...(breakdown.today || []), ...(breakdown.tomorrow || []), ...(breakdown.dayAfter || [])];
      if (steps.length > 0) {
        const subtasks = steps.map((s, idx) => ({
          id: `sub-${idx}-${Date.now()}`,
          title: s,
          completed: false
        }));
        const updated = { ...task, subtasks };
        if (isDemo) {
          setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
        } else {
          await saveTask(updated);
        }
        incrementAiUsage();
      }
    }
  };

  // ==========================================
  // GOALS ACTIONS
  // ==========================================
  const addGoal = async (title: string, type: Goal['type'], targetDate: string) => {
    if (!user) return;
    const newGoal: Omit<Goal, 'id'> = {
      userId: user.id,
      title,
      type,
      targetDate,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    if (isDemo) {
      const record = { ...newGoal, id: `goal-${Date.now()}` } as Goal;
      setGoals((prev) => [record, ...prev]);
    } else {
      await saveGoal(newGoal);
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updated = { ...goal, progress };

    if (isDemo) {
      setGoals((prev) => prev.map((g) => g.id === goalId ? updated : g));
    } else {
      await saveGoal(updated);
    }
  };

  const removeGoal = async (goalId: string) => {
    if (isDemo) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } else {
      await deleteGoal(goalId);
    }
  };

  // ==========================================
  // HABITS ACTIONS
  // ==========================================
  const addHabit = async (title: string) => {
    if (!user) return;
    const newHabit: Omit<Habit, 'id'> = {
      userId: user.id,
      title,
      streak: 0,
      consistencyScore: 100,
      completions: [],
      createdAt: new Date().toISOString()
    };

    if (isDemo) {
      const record = { ...newHabit, id: `habit-${Date.now()}` } as Habit;
      setHabits((prev) => [record, ...prev]);
    } else {
      await saveHabit(newHabit);
    }
  };

  const toggleHabitCompletion = async (habitId: string, dateStr: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    
    let completions = [...habit.completions];
    const completedIdx = completions.indexOf(dateStr);
    
    if (completedIdx > -1) {
      completions.splice(completedIdx, 1);
    } else {
      completions.push(dateStr);
    }

    // Recalculate Streak (Consecutive days including today/yesterday)
    completions.sort();
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let currentCheck = today;
    // If yesterday was completed but not today, start check from yesterday
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today.getTime() - 24*60*60*1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (!completions.includes(todayStr) && completions.includes(yesterdayStr)) {
      currentCheck = yesterday;
    }

    while (completions.includes(currentCheck.toISOString().split('T')[0])) {
      streak++;
      currentCheck = new Date(currentCheck.getTime() - 24*60*60*1000);
    }

    // Consistency score (e.g., completions over last 14 days)
    const consistencyScore = Math.min(Math.round((completions.length / 10) * 100), 100);

    const updated = { ...habit, completions, streak, consistencyScore };

    if (isDemo) {
      setHabits((prev) => prev.map((h) => h.id === habitId ? updated : h));
    } else {
      await saveHabit(updated);
    }
  };

  const removeHabit = async (habitId: string) => {
    if (isDemo) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    } else {
      await deleteHabit(habitId);
    }
  };

  // ==========================================
  // DAILY PLANS ACTIONS
  // ==========================================
  const generateTodayPlan = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const response = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tasks: tasks.filter(t => t.status === 'pending'),
        habits: habits.map(h => h.title),
        date: todayStr,
        focusHistory: "Early-morning focus output before 10:00 AM"
      })
    });

    if (response.ok) {
      const planData = await response.json();
      const plan: DailyPlan = {
        id: `${user.id}_${todayStr}`,
        userId: user.id,
        date: todayStr,
        tasks: planData.tasks,
        focusHours: planData.focusHours || 6,
        createdAt: new Date().toISOString()
      };
      setDailyPlan(plan);
      if (!isDemo) {
        await saveDailyPlan(plan);
      }
    }
  };

  // ==========================================
  // PERFORMANCE COACH REPORT
  // ==========================================
  const generateProductivityReport = async () => {
    if (!user) return;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const missedCount = tasks.filter(t => {
      const isPast = new Date(t.deadline).getTime() < Date.now();
      return isPast && t.status === 'pending';
    }).length;

    const response = await fetch('/api/gemini/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasks,
        habits: habits,
        completedCount,
        missedCount
      })
    });

    if (response.ok) {
      const reportData = await response.json();
      const newReport: ProductivityReport = {
        id: `report-${Date.now()}`,
        userId: user.id,
        score: reportData.score || 75,
        strengths: reportData.strengths || ["Consistent routine starting"],
        weaknesses: reportData.weaknesses || ["Delaying large blocks"],
        suggestions: reportData.suggestions || ["Break down milestones further"],
        generatedAt: new Date().toISOString()
      };
      setReport(newReport);
      if (!isDemo) {
        await saveProductivityReport(newReport);
      }
    }
  };

  // ==========================================
  // READ NOTIFICATIONS
  // ==========================================
  const readNotification = async (id: string) => {
    if (isDemo) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } else {
      await markNotificationAsRead(id);
    }
  };

  // ==========================================
  // STRATEGY PLANS ACTIONS
  // ==========================================
  const addStrategyPlan = async (name: string, nodes: any[], edges: any[]): Promise<StrategyPlan> => {
    if (!user) throw new Error("Must be logged in to save plans");
    
    const newPlan: Omit<StrategyPlan, 'id'> = {
      userId: user.id,
      name,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let saved: StrategyPlan;
    if (isDemo) {
      saved = { ...newPlan, id: `plan-${Date.now()}` } as StrategyPlan;
      setStrategyPlans((prev) => [saved, ...prev]);
    } else {
      saved = await saveStrategyPlan(newPlan) as StrategyPlan;
      
      // Also sync to MongoDB if available
      try {
        await fetch('/api/mongodb/sync/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, plan: saved })
        });
      } catch (err) {
        console.log('MongoDB sync skipped for plan');
      }
    }
    
    showToast(`Strategy plan '${name}' saved successfully!`, 'success');
    return saved;
  };

  const updateStrategyPlan = async (plan: StrategyPlan) => {
    if (!user) return;
    const updatedPlan = { ...plan, updatedAt: new Date().toISOString() };
    
    if (isDemo) {
      setStrategyPlans((prev) => prev.map((p) => p.id === plan.id ? updatedPlan : p));
    } else {
      await saveStrategyPlan(updatedPlan);
      
      // Sync to MongoDB
      try {
        await fetch('/api/mongodb/sync/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, plan: updatedPlan })
        });
      } catch (err) {
        console.log('MongoDB sync skipped');
      }
    }
    showToast(`Plan '${plan.name}' updated.`, 'success');
  };

  const removeStrategyPlan = async (planId: string) => {
    if (isDemo) {
      setStrategyPlans((prev) => prev.filter((p) => p.id !== planId));
    } else {
      await deleteStrategyPlan(planId);
      
      // Delete from MongoDB
      try {
        await fetch('/api/mongodb/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: 'plans', id: planId })
        });
      } catch (err) {
        console.log('MongoDB deletion skipped');
      }
    }
    showToast('Plan removed.', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      tasks,
      goals,
      habits,
      dailyPlan,
      report,
      notifications,
      strategyPlans,
      loading,
      isDemo,
      activeTab,
      setActiveTab,
      startDemoMode,
      loginWithGoogle,
      logout,
      googleAccessToken,
      
      // Premium & Upgrade
      showUpgradeModal,
      setShowUpgradeModal,
      upgradeUserPlan,
      aiUsageCount,
      checkAiAccess,
      incrementAiUsage,
      fixGrammarWithAi,
      
      // Credentials Auth & badges
      signUpWithCredentials,
      loginWithCredentials,
      sendPasswordReset,
      updateReminderSettings,
      updateUserProfile,
      unlockBadge,
      simulateReminderAlert,
      
      // Toasts
      toasts,
      showToast,
      dismissToast,
      
      addTask,
      toggleTaskStatus,
      toggleSubtaskStatus,
      removeTask,
      updateTaskProgress,
      triggerDeadlineRescue,
      triggerProcrastinationAnalysis,
      triggerTaskBreakdown,
      
      addGoal,
      updateGoalProgress,
      removeGoal,
      
      addHabit,
      toggleHabitCompletion,
      removeHabit,
      
      generateTodayPlan,
      generateProductivityReport,
      readNotification,
      
      // Strategy Plans
      addStrategyPlan,
      updateStrategyPlan,
      removeStrategyPlan
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
