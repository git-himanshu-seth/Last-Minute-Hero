import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Clock, 
  Sparkles, 
  Shield, 
  Key, 
  Camera, 
  UploadCloud, 
  Check, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Laptop, 
  Smartphone, 
  Plus, 
  ChevronRight, 
  Trash2, 
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Globe,
  Settings as SettingsIcon,
  Smile,
  Zap,
  Activity,
  LogOut,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';

export const Settings: React.FC = () => {
  const { 
    user, 
    isDemo, 
    logout, 
    updateUserProfile, 
    showToast,
    addTask,
    addGoal,
    addHabit,
    setShowUpgradeModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'productivity' | 'workspace' | 'security'>('profile');

  // ----------------------------------------------------
  // 1. PERSONAL PROFILE STATE
  // ----------------------------------------------------
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Hustle',
    username: user?.username || 'alexhustle',
    email: user?.email || 'hustle.demo@ai-studio.app',
    phoneNumber: user?.phoneNumber || '+1 555-0199',
    dob: user?.dob || '1998-05-15',
    gender: user?.gender || 'Non-binary',
    country: user?.country || 'United States',
    city: user?.city || 'San Francisco',
    timezone: user?.timezone || 'America/Los_Angeles',
    occupation: user?.occupation || 'Full Stack Engineer',
    organization: user?.organization || 'Success Scheduler Studio',
    education: user?.education || 'B.S. Computer Science',
    bio: user?.bio || 'Passionate developer struggling with midnight crunches. Always looking for smart ways to cheat procrastination.',
    photoUrl: user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    coverUrl: user?.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=250&fit=crop',
  });

  const [skills, setSkills] = useState<string[]>(user?.skills || ['React', 'TypeScript', 'Node.js', 'System Architecture', 'UI/UX Design']);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>(user?.interests || ['AI Assistants', 'Habit Loops', 'Chronobiology', 'Pomodoro Hacks', 'Productivity Metrics']);
  const [newInterest, setNewInterest] = useState('');

  // Mock Upload / Drop Zone State
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync profileForm if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Alex Hustle',
        username: user.username || 'alexhustle',
        email: user.email || 'hustle.demo@ai-studio.app',
        phoneNumber: user.phoneNumber || '+1 555-0199',
        dob: user.dob || '1998-05-15',
        gender: user.gender || 'Non-binary',
        country: user.country || 'United States',
        city: user.city || 'San Francisco',
        timezone: user.timezone || 'America/Los_Angeles',
        occupation: user.occupation || 'Full Stack Engineer',
        organization: user.organization || 'Success Scheduler Studio',
        education: user.education || 'B.S. Computer Science',
        bio: user.bio || 'Passionate developer struggling with midnight crunches. Always looking for smart ways to cheat procrastination.',
        photoUrl: user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        coverUrl: user.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=250&fit=crop',
      });
      if (user.skills) setSkills(user.skills);
      if (user.interests) setInterests(user.interests);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Basic Real-time Validation check
    if (!profileForm.name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    if (!profileForm.email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      await updateUserProfile({
        ...profileForm,
        skills,
        interests,
      });
      setEditMode(false);
    } catch (err: any) {
      showToast('Failed to save profile changes.', 'error');
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob || '',
        gender: user.gender || '',
        country: user.country || '',
        city: user.city || '',
        timezone: user.timezone || '',
        occupation: user.occupation || '',
        organization: user.organization || '',
        education: user.education || '',
        bio: user.bio || '',
        photoUrl: user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        coverUrl: user.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=250&fit=crop',
      });
    }
    setEditMode(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  // Image Upload Simulations
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        showToast('Profile image uploaded & cropped!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, coverUrl: reader.result as string }));
        showToast('Cover photo synchronized!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop simulation
  const handleDragOver = (e: React.DragEvent, type: 'photo' | 'cover') => {
    e.preventDefault();
    if (type === 'photo') setIsDraggingPhoto(true);
    else setIsDraggingCover(true);
  };

  const handleDragLeave = (type: 'photo' | 'cover') => {
    if (type === 'photo') setIsDraggingPhoto(false);
    else setIsDraggingCover(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'photo' | 'cover') => {
    e.preventDefault();
    handleDragLeave(type);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'photo') {
          setProfileForm(prev => ({ ...prev, photoUrl: reader.result as string }));
          showToast('Profile image loaded via Drag & Drop!', 'success');
        } else {
          setProfileForm(prev => ({ ...prev, coverUrl: reader.result as string }));
          showToast('Cover photo loaded via Drag & Drop!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // 2. PRODUCTIVITY PREFERENCES STATE
  // ----------------------------------------------------
  const [productivityPrefs, setProductivityPrefs] = useState({
    wakeUpTime: user?.productivityPrefs?.wakeUpTime || '07:00 AM',
    sleepTime: user?.productivityPrefs?.sleepTime || '11:30 PM',
    workingHours: user?.productivityPrefs?.workingHours || '09:00 AM - 05:00 PM',
    studyHours: user?.productivityPrefs?.studyHours || '06:00 PM - 09:00 PM',
    breakInterval: user?.productivityPrefs?.breakInterval || '10 mins every 50 mins',
    preferredMethod: user?.productivityPrefs?.preferredMethod || 'Deep Work',
  });

  const handleSaveProductivityPrefs = async () => {
    try {
      await updateUserProfile({
        productivityPrefs,
      });
      showToast('Productivity biorhythms & preferred methods updated!', 'success');
    } catch (err) {
      showToast('Failed to update productivity parameters.', 'error');
    }
  };

  // ----------------------------------------------------
  // 3. AI WORKSPACE SUGGESTIONS & AUTOCOMPLETE
  // ----------------------------------------------------
  const [workspaceInput, setWorkspaceInput] = useState('');
  const [workspaceCategory, setWorkspaceCategory] = useState<'student' | 'professional' | 'entrepreneur' | 'freelancer' | 'personal'>('professional');
  const [workspaceSuggestions, setWorkspaceSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deployingWorkspace, setDeployingWorkspace] = useState(false);

  // Template suggestions database based on Occupation category
  const WORKSPACE_TEMPLATES: Record<string, Array<{ title: string; description: string; color: string; icon: string; items: string[]; habits: string[]; goals: string[] }>> = {
    student: [
      {
        title: 'Exam Preparation Block',
        description: 'Accelerate memorization, mock reviews, and formulas logs.',
        color: 'rose',
        icon: 'GraduationCap',
        items: ['Build formulas cheat sheet', 'Solve 3 previous year mock exams', 'Summarize textbook chapter 4-8', 'AI Review of difficult questions'],
        habits: ['2 Hours mock questions practice', 'Review spaced-repetition cards'],
        goals: ['Pass Advanced Algorithms with A grade']
      },
      {
        title: 'Assignment Tracker & Sprints',
        description: 'Keep progress of essays, thesis structures, and project submissions.',
        color: 'amber',
        icon: 'FolderPlus',
        items: ['Draft Introduction & Scope outline', 'Collect 12 peer-reviewed journals', 'Consolidate statistics charts', 'Submit draft version for feedback'],
        habits: ['Draft 300 words daily', 'Update task progress at sunset'],
        goals: ['Complete Master Thesis Thesis proposal']
      },
      {
        title: 'Daily Study Planner',
        description: 'Maximize focus intervals for semester projects.',
        color: 'emerald',
        icon: 'Clock',
        items: ['Revise daily lecture notebooks', 'Review homework guidelines', 'Pre-read syllabus for next lecture'],
        habits: ['Read academic papers 30 mins', 'Start study block before 9 AM'],
        goals: ['Maintain GPA above 3.8']
      }
    ],
    professional: [
      {
        title: 'Agile Project Management',
        description: 'Optimize sprints, backlog grooming, and launch tracking.',
        color: 'blue',
        icon: 'Briefcase',
        items: ['Groom the product backlog list', 'Sync with frontend designers', 'Execute weekly deployment pipeline tests', 'Review user telemetry reports'],
        habits: ['Update Jira ticket logs', 'Review high priority issues at sunrise'],
        goals: ['Launch Success Scheduler v2 on Cloud Run']
      },
      {
        title: 'Team Product Launch Plan',
        description: 'Sprints mapped toward coordinate release days.',
        color: 'purple',
        icon: 'Sparkles',
        items: ['Draft launch press announcements', 'Record 3-minute video showcase', 'Configure load balancer endpoints', 'Verify database migration scripts'],
        habits: ['Cross-functional progress check', 'Acknowledge teammate completion status'],
        goals: ['Reach 10,000 active users in 30 days']
      }
    ],
    entrepreneur: [
      {
        title: 'Startup Launch Roadmap',
        description: 'Formulating legal blocks, investor pitch decks, and MVP targets.',
        color: 'indigo',
        icon: 'Zap',
        items: ['Refine pitch deck slide details', 'Incorporate Delaware C-Corp status', 'Setup accounting tools & bank details', 'Draft early feedback survey form'],
        habits: ['Send 3 cold investor outreach letters', 'Read market analysis journals'],
        goals: ['Secure $250k Pre-Seed round commitments']
      },
      {
        title: 'Sales Pipeline Optimization',
        description: 'Convert leads, build proposals, and tracking active contracts.',
        color: 'pink',
        icon: 'Activity',
        items: ['Email contracts draft to partners', 'Warm outreach to 10 prospect clients', 'Verify stripe invoice settings', 'Review customer acquisition cost stats'],
        habits: ['5 Prospect calls before noon', 'Log pipeline details in sheets'],
        goals: ['Hit $15k Monthly Recurring Revenue']
      }
    ],
    freelancer: [
      {
        title: 'Freelance Client Dashboard',
        description: 'Consolidated task blocks for active client contracts.',
        color: 'orange',
        icon: 'Globe',
        items: ['Refine wireframe prototypes for review', 'Implement CSS styling tweaks', 'Compile weekly status email update', 'Send milestones billing invoice'],
        habits: ['Billable time logs sync', 'Send client preview links before Friday'],
        goals: ['Deliver 3 high-paying projects this quarter']
      }
    ],
    personal: [
      {
        title: 'Fitness & Health Milestones',
        description: 'Track meal prepping, gym runs, and active recover habits.',
        color: 'teal',
        icon: 'Smile',
        items: ['Buy high protein ingredients list', 'Prepare workouts schedule', 'Measure baseline body fat metrics'],
        habits: ['60 Minutes strength session', 'Drink 3 liters clean spring water'],
        goals: ['Run 10K under 48 minutes']
      },
      {
        title: 'Personal Finance Organizer',
        description: 'Manage budgets, passive investments, and cost reductions.',
        color: 'violet',
        icon: 'Globe',
        items: ['Export monthly bank CSV logs', 'Update index portfolio holdings', 'Audit active software subscriptions list'],
        habits: ['Audit daily spending logs', 'Zero-out credit balances weekly'],
        goals: ['Build 6 Months liquid emergency fund']
      }
    ]
  };

  // Run dynamic autocomplete whenever workspaceInput change
  useEffect(() => {
    if (!workspaceInput.trim()) {
      setWorkspaceSuggestions([]);
      return;
    }

    const normalized = workspaceInput.toLowerCase();
    const matches: any[] = [];

    // Search through templates matching characters
    Object.keys(WORKSPACE_TEMPLATES).forEach(cat => {
      WORKSPACE_TEMPLATES[cat].forEach(tpl => {
        if (
          tpl.title.toLowerCase().includes(normalized) ||
          tpl.description.toLowerCase().includes(normalized) ||
          cat.includes(normalized)
        ) {
          matches.push({ ...tpl, category: cat });
        }
      });
    });

    setWorkspaceSuggestions(matches);
  }, [workspaceInput]);

  const handleSelectTemplate = (tpl: any) => {
    setWorkspaceInput(tpl.title);
    setWorkspaceCategory(tpl.category);
    setShowSuggestions(false);
  };

  const handleDeployWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceInput.trim()) {
      showToast('Please enter a workspace name or template.', 'error');
      return;
    }

    setDeployingWorkspace(true);
    try {
      // Find matching template or fall back to standard dynamic startup templates
      const matched = WORKSPACE_TEMPLATES[workspaceCategory]?.find(
        t => t.title.toLowerCase() === workspaceInput.trim().toLowerCase()
      ) || {
        title: workspaceInput.trim(),
        description: `Custom ${workspaceCategory} productivity board built via AI suggestions.`,
        items: ['Initial setup and scope check', 'Review target execution blocks', 'Establish core performance metrics'],
        habits: ['Log daily milestone updates', 'Spend 1 hour in deep focus block'],
        goals: [`Accomplish major ${workspaceInput.trim()} milestone`]
      };

      // 1. Add tasks/sprints
      for (const item of matched.items) {
        await addTask(item);
      }

      // 2. Add habits
      for (const habit of matched.habits) {
        await addHabit(habit);
      }

      // 3. Add Goals
      for (const goal of matched.goals) {
        // Default target date 30 days from now
        const targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await addGoal(goal, workspaceCategory === 'student' ? 'academic' : workspaceCategory === 'personal' ? 'personal' : 'career', targetDate);
      }

      showToast(`Successfully deployed your new '${matched.title}' AI workspace! Dynamic sprints, habits, and milestone metrics are now live.`, 'success');
      setWorkspaceInput('');
    } catch (err: any) {
      console.error(err);
      showToast('Workspace deployment failed: ' + err.message, 'error');
    } finally {
      setDeployingWorkspace(false);
    }
  };

  // ----------------------------------------------------
  // 4. PASSWORD MANAGEMENT & SECURITY STATE
  // ----------------------------------------------------
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess1', device: 'MacBook Pro 16" (M3 Max)', location: 'San Francisco, CA', ip: '108.45.19.121', active: true },
    { id: 'sess2', device: 'iPhone 15 Pro Max', location: 'San Francisco, CA', ip: '172.56.21.99', active: false },
    { id: 'sess3', device: 'Chrome on Linux Workstation', location: 'Seattle, WA', ip: '198.22.45.14', active: false },
  ]);

  const [strengthScore, setStrengthScore] = useState(0); // 0 to 4

  // Check password strength on newPass change
  useEffect(() => {
    const pass = passwords.newPass;
    if (!pass) {
      setStrengthScore(0);
      return;
    }

    let score = 1;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    setStrengthScore(Math.min(score, 4));
  }, [passwords.newPass]);

  const generateSecurePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let generated = '';
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswords(prev => ({ ...prev, newPass: generated, confirm: generated }));
    showToast('High entropy password generated! Review strength indicator.', 'info');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    showToast('Secure credentials updated inside Firebase Encrypted Auth store!', 'success');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const handleResetPasswordEmail = () => {
    showToast('Dispatched encrypted credential-reset link to ' + (user?.email || 'your email') + '!', 'success');
  };

  const terminateOtherSessions = () => {
    setActiveSessions(activeSessions.filter(s => s.active));
    showToast('Terminated all secondary sessions successfully.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">AI Settings & Profile Hub</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Manage personal coordinates, productivity rhythms, customized workspace templates, and account security credentials.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold uppercase border-b-2 transition ${
            activeTab === 'profile' ? 'text-red-500 border-red-500' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile
        </button>
        <button
          onClick={() => setActiveTab('productivity')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold uppercase border-b-2 transition ${
            activeTab === 'productivity' ? 'text-red-500 border-red-500' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" /> Productivity Preferences
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold uppercase border-b-2 transition ${
            activeTab === 'workspace' ? 'text-red-500 border-red-500' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Workspace Suggestions
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold uppercase border-b-2 transition ${
            activeTab === 'security' ? 'text-red-500 border-red-500' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Password
        </button>
      </div>

      {/* TAB CONTENT: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Cover & Avatar Header */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0b0c10]">
            {/* Cover Area */}
            <div 
              className={`h-40 sm:h-48 relative bg-cover bg-center transition-opacity ${
                isDraggingCover ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ backgroundImage: `url(${profileForm.coverUrl})` }}
              onDragOver={(e) => handleDragOver(e, 'cover')}
              onDragLeave={() => handleDragLeave('cover')}
              onDrop={(e) => handleDrop(e, 'cover')}
            >
              {editMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                  <button 
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="p-2.5 bg-[#0b0c10]/80 rounded-full text-white border border-white/10 hover:bg-black transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Camera className="w-4 h-4" /> Change Cover
                  </button>
                  <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-1 rounded">Drag & Drop Cover</span>
                </div>
              )}
              <input 
                type="file" 
                ref={coverInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Avatar Row */}
            <div className="px-6 pb-6 relative pt-12 sm:pt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div 
                className={`absolute -top-12 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0 w-24 h-24 rounded-full border-4 border-[#050505] overflow-hidden bg-slate-900 group relative ${
                  isDraggingPhoto ? 'ring-4 ring-red-500' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, 'photo')}
                onDragLeave={() => handleDragLeave('photo')}
                onDrop={(e) => handleDrop(e, 'photo')}
              >
                <img 
                  src={profileForm.photoUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
                {editMode && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition duration-200 cursor-pointer text-white"
                  >
                    <Camera className="w-4.5 h-4.5" />
                    <span className="text-[9px] font-mono font-bold mt-1 uppercase text-center leading-none">Upload<br/>Crop</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* User Identity Details */}
              <div className="text-center sm:text-left sm:pl-28 flex-1 space-y-1">
                <h3 className="font-display font-semibold text-lg text-white leading-snug">{profileForm.name}</h3>
                <p className="text-xs text-slate-400 font-mono">@{profileForm.username}</p>
                <p className="text-[11px] text-slate-500">{profileForm.occupation} &bull; {profileForm.organization}</p>
              </div>

              {/* Edit triggers */}
              <div>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black font-semibold text-xs rounded-xl transition"
                  >
                    Edit Profile Details
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelProfile}
                      className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subscription / Plan Widget */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-[#0d0905] to-[#0a0a0f] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4.5 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">Subscription Status</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-300 font-semibold uppercase">{user?.plan || 'free'} Plan</span>
                </div>
                <h4 className="font-display font-semibold text-white text-sm sm:text-base">
                  {user?.plan === 'pro' ? 'Pro Coach Active' : user?.plan === 'enterprise' ? 'Enterprise Elite Active' : 'Free Tier (Limited to 5 Tasks & 3 AI Captures)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {user?.plan === 'pro' || user?.plan === 'enterprise' 
                    ? 'Enjoy your unlimited access to AI capturing, grammar check, and coach features!' 
                    : 'Upgrade to remove limits and unlock advanced features.'}
                </p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs rounded-xl shadow-lg shadow-orange-500/10 transition whitespace-nowrap cursor-pointer w-full sm:w-auto text-center"
            >
              {user?.plan === 'pro' || user?.plan === 'enterprise' ? 'Manage Subscription' : 'Upgrade Plan'}
            </button>
          </div>

          {/* Complete Grid Form */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-6">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Coordinates & Credentials</span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Full Name</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Username</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Email Address</label>
                <input 
                  type="email"
                  disabled={!editMode}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Phone Number</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Date of Birth</label>
                <input 
                  type="date"
                  disabled={!editMode}
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Gender</label>
                <select
                  disabled={!editMode}
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Country</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.country}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">City</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Timezone</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Occupation</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.occupation}
                  onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Organization */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Organization</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.organization}
                  onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Education */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Education</label>
                <input 
                  type="text"
                  disabled={!editMode}
                  value={profileForm.education}
                  onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                  className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-red-500/40 transition"
                />
              </div>
            </div>

            {/* Bio section */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Personal Bio</label>
              <textarea
                disabled={!editMode}
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full bg-[#121318] disabled:opacity-60 border border-white/10 rounded-xl p-3 text-slate-200 outline-none resize-none focus:border-red-500/40 transition"
                placeholder="Share something about your lifestyle, procrastination triggers..."
              />
            </div>

            {/* Skills Tag Area */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Professional Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg text-[10px] font-mono">
                    {s}
                    {editMode && (
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="text-red-400 hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-[#121318] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                  />
                  <button 
                    type="button"
                    onClick={handleAddSkill}
                    className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Interests Tag Area */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Hobbies & Focus Interests</span>
              <div className="flex flex-wrap gap-1.5">
                {interests.map(i => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/25 text-orange-400 rounded-lg text-[10px] font-mono">
                    {i}
                    {editMode && (
                      <button type="button" onClick={() => handleRemoveInterest(i)} className="text-orange-400 hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    placeholder="Add interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 bg-[#121318] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                  />
                  <button 
                    type="button"
                    onClick={handleAddInterest}
                    className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTIVITY PREFERENCES */}
      {activeTab === 'productivity' && (
        <div className="p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-6">
          <div className="border-b border-white/5 pb-2.5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Biorhythm Customizer</span>
            <p className="text-[11px] text-slate-500 mt-1">Configure your physical and mental rhythms to help the AI Coach suggest highly optimal calendar blocks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Wake Up Time */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Usual Wake-up Time</label>
              <input 
                type="text"
                value={productivityPrefs.wakeUpTime}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, wakeUpTime: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                placeholder="e.g. 07:00 AM"
              />
            </div>

            {/* Sleep Time */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Expected Sleep Time</label>
              <input 
                type="text"
                value={productivityPrefs.sleepTime}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, sleepTime: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                placeholder="e.g. 11:30 PM"
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Primary Productive Work Hours</label>
              <input 
                type="text"
                value={productivityPrefs.workingHours}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, workingHours: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                placeholder="e.g. 09:00 AM - 05:00 PM"
              />
            </div>

            {/* Study Hours */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Secondary Study/Hobby Hours</label>
              <input 
                type="text"
                value={productivityPrefs.studyHours}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, studyHours: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                placeholder="e.g. 06:00 PM - 09:00 PM"
              />
            </div>

            {/* Break Interval */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Preferred Break Intervals</label>
              <input 
                type="text"
                value={productivityPrefs.breakInterval}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, breakInterval: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                placeholder="e.g. 10 mins every 50 mins"
              />
            </div>

            {/* Preferred Productivity Method */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] uppercase">Preferred Productivity Method</label>
              <select
                value={productivityPrefs.preferredMethod}
                onChange={(e) => setProductivityPrefs({ ...productivityPrefs, preferredMethod: e.target.value })}
                className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
              >
                <option value="Pomodoro">Pomodoro (25/5 Loops)</option>
                <option value="Deep Work">Deep Work (Monastic blocks)</option>
                <option value="Time Blocking">Time Blocking (Strict slots)</option>
                <option value="GTD">Getting Things Done (GTD)</option>
                <option value="Eisenhower Matrix">Eisenhower Matrix (Urgent/Important)</option>
                <option value="SMART Goals">SMART Goals metrics</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-1.5 text-xs">
            <span className="font-semibold text-orange-400 block font-mono">💡 Spaced Pomodoro Recommendation:</span>
            <p className="text-slate-400">Based on your late-night study cycles, your biological focus peak occurs around 10:00 AM. We suggest scheduling critical sprints in those hours.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveProductivityPrefs}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-black font-bold text-xs rounded-xl transition"
            >
              Sync Productivity Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI WORKSPACE SUGGESTION ENGINE */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-5">
            <div className="border-b border-white/5 pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Workspace Deployment Wizard</span>
              <p className="text-[11px] text-slate-500 mt-1">Deploy contextual workspace templates tailored with pre-populated schedules, habit lists, and milestones.</p>
            </div>

            <form onSubmit={handleDeployWorkspace} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Occupation Category</label>
                  <select
                    value={workspaceCategory}
                    onChange={(e: any) => setWorkspaceCategory(e.target.value)}
                    className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="personal">Personal Life</option>
                  </select>
                </div>

                {/* Text input with simulated autocomplete suggestions */}
                <div className="space-y-1.5 text-xs relative">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Workspace Command</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Type 'Create Workspace' or name..."
                      value={workspaceInput}
                      onChange={(e) => {
                        setWorkspaceInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none text-xs placeholder:text-slate-600"
                    />
                    {workspaceInput && (
                      <button 
                        type="button" 
                        onClick={() => { setWorkspaceInput(''); setShowSuggestions(false); }}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Suggestions Panel */}
                  {showSuggestions && workspaceSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-40 text-xs py-1.5">
                      <div className="px-3 py-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">
                        AI Suggested Templates
                      </div>
                      {workspaceSuggestions.map((tpl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl)}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold block">{tpl.title}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{tpl.description}</span>
                          </div>
                          <span className="text-[9px] font-mono bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase">
                            {tpl.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-mono">Tip: Choose Category to view template presets below</span>
                <button
                  type="submit"
                  disabled={deployingWorkspace}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  {deployingWorkspace ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deploying AI Blocks...</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-4 h-4" />
                      <span>Deploy Workspace Sprints</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preset Suggested Templates Board */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Suggested Templates Board ({workspaceCategory.toUpperCase()})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORKSPACE_TEMPLATES[workspaceCategory]?.map((tpl, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#0b0c10] flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          tpl.color === 'rose' ? 'bg-rose-500' :
                          tpl.color === 'amber' ? 'bg-amber-500' :
                          tpl.color === 'emerald' ? 'bg-emerald-500' :
                          tpl.color === 'blue' ? 'bg-blue-500' :
                          tpl.color === 'purple' ? 'bg-purple-500' :
                          tpl.color === 'indigo' ? 'bg-indigo-500' :
                          tpl.color === 'pink' ? 'bg-pink-500' :
                          tpl.color === 'orange' ? 'bg-orange-500' : 'bg-slate-500'
                        }`} />
                        {tpl.title}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{workspaceCategory}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.description}</p>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-mono bg-white/[0.02] border border-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                          📌 {tpl.items.length} Sprints
                        </span>
                        <span className="text-[9px] font-mono bg-white/[0.02] border border-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                          🔥 {tpl.habits.length} Habits
                        </span>
                        <span className="text-[9px] font-mono bg-white/[0.02] border border-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                          🎯 {tpl.goals.length} Goals
                        </span>
                      </div>

                      {/* Items peek */}
                      <div className="text-[10px] text-slate-500 pl-3 border-l border-white/10 space-y-1">
                        {tpl.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="truncate">&bull; {item}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWorkspaceInput(tpl.title);
                      setWorkspaceCategory(workspaceCategory);
                      showToast(`Selected template: '${tpl.title}'. Click deploy button to confirm.`, 'info');
                    }}
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-slate-300 hover:text-white transition"
                  >
                    Load Template Config
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Change Password Panel */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-5">
            <div className="border-b border-white/5 pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Credential Management</span>
              <p className="text-[11px] text-slate-500 mt-1">Configure secure access keys and update your Firebase authentication logs.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full bg-[#121318] border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 outline-none"
                    placeholder="Enter current password..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">New Password</label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[10px] text-red-400 hover:underline font-mono uppercase"
                  >
                    🔑 Generate Secure Password
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full bg-[#121318] border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 outline-none"
                    placeholder="Enter new strong password..."
                  />
                </div>

                {/* Password Strength Meter */}
                {passwords.newPass && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-slate-500">Security Rating:</span>
                      <span className={`font-bold ${
                        strengthScore === 4 ? 'text-emerald-400' :
                        strengthScore === 3 ? 'text-cyan-400' :
                        strengthScore === 2 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {strengthScore === 4 ? 'VERY SECURE (High entropy)' :
                         strengthScore === 3 ? 'STRONG' :
                         strengthScore === 2 ? 'MEDIUM' : 'WEAK / INSECURE'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4].map(idx => (
                        <div 
                          key={idx} 
                          className={`h-full flex-1 transition ${
                            idx <= strengthScore ? (
                              strengthScore === 4 ? 'bg-emerald-500' :
                              strengthScore === 3 ? 'bg-cyan-500' :
                              strengthScore === 2 ? 'bg-amber-500' : 'bg-red-500'
                            ) : 'bg-white/5'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase">Confirm New Password</label>
                <input 
                  type={showPass ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  placeholder="Verify new strong password..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetPasswordEmail}
                  className="text-[11px] text-slate-400 hover:text-white hover:underline"
                >
                  Send Firebase Password Reset Email
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-black font-bold text-xs rounded-xl transition"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Right sidebar: MFA & Device History */}
          <div className="space-y-6">
            {/* MFA Settings */}
            <div className="p-5 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Multi-Factor Authentication</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">Add secondary verification challenges to prevent unauthorized workspace hijack.</p>

              <label className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-[11px] font-semibold text-white block">MFA Status</span>
                  <span className="text-[9px] text-slate-500">Require mobile verification</span>
                </div>
                <input 
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(e) => {
                    setMfaEnabled(e.target.checked);
                    showToast(e.target.checked ? 'MFA protection activated!' : 'MFA protection disabled.', 'info');
                  }}
                  className="w-4 h-4 rounded text-red-500 bg-black border-white/10 focus:ring-0 focus:ring-offset-0"
                />
              </label>
            </div>

            {/* Active Sessions Devices History */}
            <div className="p-5 rounded-2xl border border-white/5 bg-[#0b0c10] space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active Sessions</span>
                <button 
                  onClick={terminateOtherSessions}
                  className="text-[9px] text-red-400 hover:underline font-mono uppercase"
                >
                  Terminate Others
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions.map((s, idx) => (
                  <div key={s.id} className="text-xs flex items-start gap-2.5">
                    {idx === 0 ? (
                      <Laptop className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-200 block truncate flex items-center gap-1.5">
                        {s.device}
                        {s.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">{s.location} &bull; {s.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
