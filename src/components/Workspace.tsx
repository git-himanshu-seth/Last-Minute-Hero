import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Kanban, 
  Plus, 
  Send, 
  UserPlus, 
  Video, 
  PhoneCall, 
  Target, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  Activity, 
  VolumeX, 
  Smile, 
  Mic, 
  MicOff, 
  VideoOff, 
  ScreenShare, 
  Clipboard, 
  ChevronRight, 
  Play, 
  Pause, 
  FileText, 
  LogOut, 
  Sparkles,
  HelpCircle,
  Layout,
  CheckSquare,
  AlertTriangle,
  Flame,
  LineChart,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleSyncHub } from './GoogleSyncHub';
import { RealtimeCall } from './RealtimeCall';
import { subscribeGroupMessages, saveGroupMessage } from '../lib/db';

// Types for the Workspace module
interface Member {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  avatarUrl: string;
  skills: string[];
  workload: number; // 0-100%
  availability: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: 'Student Group' | 'Startup Team' | 'Organization' | 'Family' | 'Friends' | 'Project Team';
  owner: string;
  members: Member[];
  createdAt: string;
}

interface GroupTask {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assignedTo: string; // member Name or ID
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done';
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 to 100
}

interface GroupGoal {
  id: string;
  groupId: string;
  title: string;
  targetDate: string;
  progress: number;
  milestones: string[];
}

interface Channel {
  id: string;
  groupId: string;
  name: string;
  type: 'public' | 'private';
}

interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAvatar: string;
  isAI: boolean;
  content: string;
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  audioDuration?: string;
  attachment?: { name: string; size: string; type: string };
}

// Initial Mock Datasets
const initialGroups: Group[] = [
  {
    id: 'g1',
    name: 'Alpha Hackathon Team',
    description: 'Developing the next-gen AI Command Center for medical/rescue coordination.',
    category: 'Project Team',
    owner: 'Sarah',
    members: [
      { id: 'm1', name: 'Sarah', role: 'Owner', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', skills: ['Node.js', 'React', 'MongoDB', 'System Architecture'], workload: 65, availability: 'Full Availability' },
      { id: 'm2', name: 'John', role: 'Admin', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', skills: ['Tailwind CSS', 'Framer Motion', 'UI/UX Design'], workload: 85, availability: 'Limited Availability' },
      { id: 'm3', name: 'David', role: 'Member', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', skills: ['TypeScript', 'Firebase', 'QA Automation'], workload: 30, availability: 'Full Availability' },
      { id: 'm4', name: 'Michael', role: 'Member', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', skills: ['Product Management', 'Pitching', 'Analytics'], workload: 45, availability: 'Full Availability' }
    ],
    createdAt: '2026-06-20'
  },
  {
    id: 'g2',
    name: 'Startup Synergy',
    description: 'SaaS product development focused on cognitive offloading and offline productivity.',
    category: 'Startup Team',
    owner: 'Sarah',
    members: [
      { id: 'm1', name: 'Sarah', role: 'Owner', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', skills: ['Node.js', 'React', 'MongoDB'], workload: 40, availability: 'Full Availability' },
      { id: 'm2', name: 'John', role: 'Member', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', skills: ['Framer Motion', 'UI/UX Design'], workload: 70, availability: 'Full Availability' }
    ],
    createdAt: '2026-06-18'
  }
];

const initialTasks: GroupTask[] = [
  { id: 't1', groupId: 'g1', title: 'Backend API Architecture', description: 'Design & build secured REST routes with real-time Express handlers and clean MongoDB fallbacks.', assignedTo: 'Sarah', priority: 'high', status: 'In Progress', deadline: '2026-06-28', progress: 70 },
  { id: 't2', groupId: 'g1', title: 'Frontend UI/UX Templates', description: 'Code responsive bento dashboard layouts using tailwind, including seamless dark aesthetics.', assignedTo: 'John', priority: 'critical', status: 'Todo', deadline: '2026-06-27', progress: 10 },
  { id: 't3', groupId: 'g1', title: 'Firebase Authentication Sync', description: 'Connect Firebase email/Google OAuth and secure the read/write paths in firestore.rules.', assignedTo: 'David', priority: 'medium', status: 'Review', deadline: '2026-06-29', progress: 90 },
  { id: 't4', groupId: 'g1', title: 'Product Pitch Deck', description: 'Assemble functional metrics, bento layouts, and slide flows for the final Hackathon jury pitch.', assignedTo: 'Michael', priority: 'low', status: 'Backlog', deadline: '2026-07-02', progress: 0 }
];

const initialGoals: GroupGoal[] = [
  { id: 'gl1', groupId: 'g1', title: 'Deliver MVP Core', targetDate: '2026-06-30', progress: 65, milestones: ['Database schema ready', 'Dashboard UI integrated', 'API tested successfully'] },
  { id: 'gl2', groupId: 'g1', title: 'Team Sync & Quality', targetDate: '2026-07-03', progress: 40, milestones: ['Test suite at 80%', 'Beta dry run completed'] }
];

const initialChannels: Channel[] = [
  { id: 'c1', groupId: 'g1', name: 'general', type: 'public' },
  { id: 'c2', groupId: 'g1', name: 'announcements', type: 'public' },
  { id: 'c3', groupId: 'g1', name: 'frontend', type: 'public' },
  { id: 'c4', groupId: 'g1', name: 'backend', type: 'public' },
  { id: 'c5', groupId: 'g1', name: 'design', type: 'public' }
];

const initialMessages: ChatMessage[] = [
  { id: 'm_msg1', channelId: 'c1', senderName: 'Sarah', senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isAI: false, content: 'Hey team! Let’s lock down the database endpoints today. I’ve updated the server.ts controllers.', timestamp: '10:14 AM' },
  { id: 'm_msg2', channelId: 'c1', senderName: 'John', senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isAI: false, content: 'Awesome! Working on the Dashboard UI. I’ll make sure it handles our real-time states nicely.', timestamp: '10:18 AM' },
  { id: 'm_msg3', channelId: 'c1', senderName: 'AI Manager', senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop', isAI: true, content: '👋 Hi Alpha Team! I am monitoring workloads. John’s capacity is currently at 85%. Sarah, if the backend tasks wrap up early, consider lending a hand with frontend layouts! Try tagging me with @AI if you want to summarize, brainstorm, or balance tasks!', timestamp: '10:20 AM' }
];

export const Workspace: React.FC = () => {
  const { user } = useApp();

  // Navigation state within the Collaboration Workspace
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'groups' | 'sprint' | 'coach' | 'goals' | 'chat' | 'calls' | 'google-sync'>('dashboard');

  // Core Data State (loaded from localStorage or initialized)
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('lifesaver_ai_groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string>('g1');

  const [tasks, setTasks] = useState<GroupTask[]>(() => {
    const saved = localStorage.getItem('lifesaver_ai_grouptasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [goals, setGoals] = useState<GroupGoal[]>(() => {
    const saved = localStorage.getItem('lifesaver_ai_groupgoals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('lifesaver_ai_channels');
    return saved ? JSON.parse(saved) : initialChannels;
  });
  const [selectedChannelId, setSelectedChannelId] = useState<string>('c1');

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for AI Coaches
  const [coachReport, setCoachReport] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem('lifesaver_ai_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('lifesaver_ai_grouptasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lifesaver_ai_groupgoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lifesaver_ai_channels', JSON.stringify(channels));
  }, [channels]);



  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
  const activeChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  // ==========================================
  // GROUP MANAGEMENT LOGIC
  // ==========================================
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<Group['category']>('Project Team');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);

  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Member' | 'Viewer'>('Member');
  const [inviteSkills, setInviteSkills] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const validEmails = inviteEmails.filter(email => email.trim() !== '');

    const newMembers: Member[] = [
      {
        id: 'm_owner',
        name: user?.name || 'Sarah',
        role: 'Owner',
        avatarUrl: user?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        skills: ['Agile Project Management', 'Fullstack Development'],
        workload: 20,
        availability: 'Full Availability'
      }
    ];

    validEmails.forEach((email, index) => {
      newMembers.push({
        id: `m_invite_${Date.now()}_${index}`,
        name: email.split('@')[0] || 'Invited User',
        role: 'Member',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=100&h=100&fit=crop`,
        skills: [],
        workload: 0,
        availability: 'Pending Invite',
        email: email
      });
      
      const subject = encodeURIComponent(`Invitation to join workspace: ${newGroupName}`);
      const body = encodeURIComponent(`Hi there,\n\nYou have been invited to join the "${newGroupName}" workspace.\n\nPlease log in to access your new team dashboard.\n\nBest,\n${user?.name || 'Your Team'}`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    });

    const newG: Group = {
      id: 'g_' + Date.now(),
      name: newGroupName,
      description: newGroupDesc,
      category: newGroupCategory,
      owner: user?.name || 'Sarah',
      members: newMembers,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setGroups([...groups, newG]);
    setSelectedGroupId(newG.id);
    setNewGroupName('');
    setNewGroupDesc('');
    setInviteEmails(['']);
    setShowCreateGroup(false);

    if (validEmails.length > 0) {
      alert(`Workspace created and invitations sent to ${validEmails.length} member(s)!`);
    }

    // Create a default general channel
    const defChan: Channel = {
      id: 'c_' + Date.now(),
      groupId: newG.id,
      name: 'general',
      type: 'public'
    };
    setChannels(prev => [...prev, defChan]);
    setSelectedChannelId(defChan.id);
  };

  const handleAddEmail = () => {
    if (inviteEmails.length < 5) {
      setInviteEmails([...inviteEmails, '']);
    } else {
      alert('Free tier allows inviting up to 5 members during workspace creation.');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;

    const newMem: Member = {
      id: 'm_' + Date.now(),
      name: inviteName,
      role: inviteRole,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=100&h=100&fit=crop`,
      skills: inviteSkills.split(',').map(s => s.trim()).filter(Boolean),
      workload: 0,
      availability: 'Full Availability'
    };

    setGroups(groups.map(g => {
      if (g.id === selectedGroupId) {
        return {
          ...g,
          members: [...g.members, newMem]
        };
      }
      return g;
    }));

    setInviteName('');
    setInviteSkills('');
  };

  const handleRemoveMember = (memberId: string) => {
    setGroups(groups.map(g => {
      if (g.id === selectedGroupId) {
        return {
          ...g,
          members: g.members.filter(m => m.id !== memberId)
        };
      }
      return g;
    }));
  };

  const handleAssignRole = (memberId: string, role: Member['role']) => {
    setGroups(groups.map(g => {
      if (g.id === selectedGroupId) {
        return {
          ...g,
          members: g.members.map(m => m.id === memberId ? { ...m, role } : m)
        };
      }
      return g;
    }));
  };

  // ==========================================
  // SHARED TASK MANAGEMENT & SPRINT LOGIC
  // ==========================================
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<GroupTask['priority']>('medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newT: GroupTask = {
      id: 't_' + Date.now(),
      groupId: selectedGroupId,
      title: taskTitle,
      description: taskDesc,
      assignedTo: taskAssignee || 'Unassigned',
      priority: taskPriority,
      status: 'Todo',
      deadline: taskDeadline || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      progress: 0
    };

    setTasks([...tasks, newT]);
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssignee('');
    setShowCreateTask(false);

    // Increase member workload
    if (taskAssignee && taskAssignee !== 'Unassigned') {
      adjustWorkload(taskAssignee, 15);
    }
  };

  const adjustWorkload = (memberName: string, delta: number) => {
    setGroups(groups.map(g => {
      if (g.id === selectedGroupId) {
        return {
          ...g,
          members: g.members.map(m => m.name === memberName ? { ...m, workload: Math.min(100, Math.max(0, m.workload + delta)) } : m)
        };
      }
      return g;
    }));
  };

  const moveTaskStatus = (taskId: string, direction: 'forward' | 'backward') => {
    const statuses: GroupTask['status'][] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currIndex = statuses.indexOf(t.status);
        let nextIndex = currIndex + (direction === 'forward' ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < statuses.length) {
          const nextStatus = statuses[nextIndex];
          const nextProgress = nextStatus === 'Done' ? 100 : nextStatus === 'Review' ? 90 : nextStatus === 'In Progress' ? 50 : 10;
          return {
            ...t,
            status: nextStatus,
            progress: nextProgress
          };
        }
      }
      return t;
    }));
  };

  const updateTaskProgressLevel = (taskId: string, progress: number) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus = progress === 100 ? 'Done' : progress >= 80 ? 'Review' : progress >= 30 ? 'In Progress' : 'Todo';
        return {
          ...t,
          progress,
          status: nextStatus as GroupTask['status']
        };
      }
      return t;
    }));
  };

  const removeGroupTask = (taskId: string) => {
    const taskObj = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    if (taskObj && taskObj.assignedTo !== 'Unassigned') {
      adjustWorkload(taskObj.assignedTo, -15);
    }
  };

  // ==========================================
  // TEAM GOALS LOGIC
  // ==========================================
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalMilestone, setGoalMilestone] = useState('');
  const [goalMilestones, setGoalMilestones] = useState<string[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  const handleAddMilestoneInput = () => {
    if (goalMilestone.trim()) {
      setGoalMilestones([...goalMilestones, goalMilestone.trim()]);
      setGoalMilestone('');
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newG: GroupGoal = {
      id: 'gl_' + Date.now(),
      groupId: selectedGroupId,
      title: goalTitle,
      targetDate: goalDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      progress: 0,
      milestones: goalMilestones.length > 0 ? goalMilestones : ['Draft outline', 'Review items']
    };

    setGoals([...goals, newG]);
    setGoalTitle('');
    setGoalDate('');
    setGoalMilestones([]);
    setShowCreateGoal(false);
  };

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, progress } : g));
  };

  const handleRemoveGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  // ==========================================
  // REAL-TIME GROUP CHAT & AI COMMANDS LOGIC
  // ==========================================
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!activeGroup?.id || !activeChannel?.id) return;
    const unsub = subscribeGroupMessages(activeGroup.id, activeChannel.id, (msgs) => {
      if (msgs && msgs.length > 0) {
        setMessages(prev => {
          const newMsgs = [...prev];
          let changed = false;
          msgs.forEach(m => {
            const exists = newMsgs.find(old => old.id === m.id);
            if (!exists) {
              newMsgs.push(m);
              changed = true;
            }
          });
          if (!changed) return prev;
          return newMsgs.sort((a,b) => {
            const timeA = a.id.split('_').pop() || '0';
            const timeB = b.id.split('_').pop() || '0';
            return parseInt(timeA) - parseInt(timeB);
          });
        });
      }
    });
    return () => unsub();
  }, [activeGroup?.id, activeChannel?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const currentMsgText = typedMessage.trim();
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      channelId: selectedChannelId,
      senderName: user?.name || 'Sarah',
      senderAvatar: user?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isAI: false,
      content: currentMsgText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    saveGroupMessage(activeGroup.id, selectedChannelId, userMsg);
    setTypedMessage('');

    // If tagged AI (contains @AI)
    if (currentMsgText.toLowerCase().includes('@ai')) {
      setIsTyping(true);
      const cleanCommand = currentMsgText.replace(/@ai/gi, '').trim();

      // Gather current workspace context for Gemini analysis
      const contextSummary = {
        groupName: activeGroup.name,
        category: activeGroup.category,
        members: activeGroup.members.map(m => ({ name: m.name, role: m.role, workload: m.workload, skills: m.skills })),
        tasks: tasks.filter(t => t.groupId === selectedGroupId).map(t => ({ title: t.title, assignedTo: t.assignedTo, priority: t.priority, status: t.status, progress: t.progress, deadline: t.deadline })),
        goals: goals.filter(g => g.groupId === selectedGroupId).map(g => ({ title: g.title, progress: g.progress }))
      };

      try {
        const response = await fetch('/api/gemini/workspace-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: cleanCommand,
            channelName: activeChannel.name,
            context: contextSummary
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiMsg: ChatMessage = {
            id: 'ai_msg_' + Date.now(),
            channelId: selectedChannelId,
            senderName: 'AI Manager',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
            isAI: true,
            content: data.response,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
          saveGroupMessage(activeGroup.id, selectedChannelId, aiMsg);
        }
      } catch (err) {
        console.error('Error fetching AI response:', err);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        const index = reactions.findIndex(r => r.emoji === emoji);
        if (index > -1) {
          const isUserReacted = reactions[index].users.includes('User');
          if (isUserReacted) {
            reactions[index].users = reactions[index].users.filter(u => u !== 'User');
            reactions[index].count -= 1;
          } else {
            reactions[index].users.push('User');
            reactions[index].count += 1;
          }
        } else {
          reactions.push({ emoji, count: 1, users: ['User'] });
        }
        return {
          ...m,
          reactions: reactions.filter(r => r.count > 0)
        };
      }
      return m;
    }));
  };

  const handleVoiceNoteClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const durationStr = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`;
          const audioMsg: ChatMessage = {
            id: 'voice_' + Date.now(),
            channelId: selectedChannelId,
            senderName: user?.name || 'Sarah',
            senderAvatar: user?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            isAI: false,
            content: '🎙️ Shared a voice message',
            audioDuration: durationStr,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, audioMsg]);
          saveGroupMessage(activeGroup.id, selectedChannelId, audioMsg);
          
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        recordIntervalRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Error accessing microphone", err);
        alert("Microphone permission denied.");
      }
    }
  };

  const handleFileShare = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(2) + ' KB';

    const fileMsg: ChatMessage = {
      id: 'file_' + Date.now(),
      channelId: selectedChannelId,
      senderName: user?.name || 'Sarah',
      senderAvatar: user?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isAI: false,
      content: `📁 Shared a file: ${file.name}`,
      attachment: { name: file.name, size: sizeStr, type: file.type || 'Document' },
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, fileMsg]);
    saveGroupMessage(activeGroup.id, selectedChannelId, fileMsg);
    
    e.target.value = '';
  };

  // ==========================================
  // AI TEAM COACH REPORT FETCHING
  // ==========================================
  const fetchCoachAnalysis = async () => {
    setCoachLoading(true);
    const activeGroupTasks = tasks.filter(t => t.groupId === selectedGroupId);
    const activeGroupGoals = goals.filter(g => g.groupId === selectedGroupId);

    try {
      const response = await fetch('/api/gemini/workspace-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: activeGroup.name,
          members: activeGroup.members,
          tasks: activeGroupTasks,
          goals: activeGroupGoals
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCoachReport(data);
      } else {
        alert('Could not retrieve coach details.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoachLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'coach') {
      fetchCoachAnalysis();
    }
  }, [activeSubTab, selectedGroupId]);

  const handleSmartBalanceRedistribution = () => {
    if (!coachReport || !coachReport.balancerSuggestions) return;
    
    // Auto-reallocate tasks based on AI Smart Balancer recommendations
    const updatedTasks = tasks.map(t => {
      const suggestion = coachReport.balancerSuggestions.find((s: any) => s.taskTitle.toLowerCase() === t.title.toLowerCase());
      if (suggestion && t.groupId === selectedGroupId) {
        return {
          ...t,
          assignedTo: suggestion.suggestedAssignee
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    alert('Smart Team Balancer has successfully redistributed the sprint workloads!');
    fetchCoachAnalysis();
  };

  // ==========================================
  // VOICE/VIDEO CALLS (WEBRTC SIMULATION) & AI STANDUP BOT & MEETING NOTES
  // ==========================================
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallRecording, setIsCallRecording] = useState(false);

  // Standup states
  const [showStandupModal, setShowStandupModal] = useState(false);
  const [standupYesterday, setStandupYesterday] = useState('');
  const [standupToday, setStandupToday] = useState('');
  const [standupBlockers, setStandupBlockers] = useState('');
  const [standupLoading, setStandupLoading] = useState(false);
  const [standupResult, setStandupResult] = useState<string | null>(null);

  // Meeting Notes Summarizer states
  const [meetingNotesTitle, setMeetingNotesTitle] = useState('');
  const [meetingNotesTranscript, setMeetingNotesTranscript] = useState('');
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [summarizerResult, setSummarizerResult] = useState<any>(null);

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setCallActive(true);
  };

  const endCall = () => {
    setCallActive(false);
    setIsScreenSharing(false);
    setIsRecording(false);
  };

  const handleStandupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStandupLoading(true);

    try {
      const response = await fetch('/api/gemini/standup-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: user?.name || 'Sarah',
          yesterday: standupYesterday,
          today: standupToday,
          blockers: standupBlockers
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStandupResult(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStandupLoading(false);
    }
  };

  const handleMeetingSummarize = async () => {
    if (!meetingNotesTranscript.trim()) return;
    setSummarizerLoading(true);

    try {
      const response = await fetch('/api/gemini/meeting-summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: meetingNotesTitle || 'Standup & Frontend Layout Sync',
          transcriptText: meetingNotesTranscript
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummarizerResult(data);

        // Auto insert suggested tasks into the database
        if (data.suggestedTasks && data.suggestedTasks.length > 0) {
          const newlyGeneratedTasks: GroupTask[] = data.suggestedTasks.map((t: any, idx: number) => ({
            id: 't_meet_' + Date.now() + idx,
            groupId: selectedGroupId,
            title: t.title,
            description: t.description,
            assignedTo: t.assignedTo || 'Unassigned',
            priority: t.priority || 'medium',
            status: 'Todo',
            deadline: new Date(Date.now() + (t.daysToDeadline || 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0
          }));

          setTasks(prev => [...prev, ...newlyGeneratedTasks]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizerLoading(false);
    }
  };

  const loadPrepopulatedMeetingTranscript = () => {
    setMeetingNotesTitle('Frontend Redesign & API Endpoint Alignment');
    setMeetingNotesTranscript(`Sarah: I finished building the user sync APIs and they are fully operational.
John: Excellent. On the UI side, I’ve completed about 80% of the landing layouts but I am getting blocked on the responsive calendar grid elements.
David: I can assist John tomorrow. My current load is light since the authentication firestore security rules are already written.
Sarah: Perfect. John, assign David to the calendar test task. Let’s target our final review by Saturday afternoon.`);
  };

  // ==========================================
  // HELPER CALCULATIONS
  // ==========================================
  const activeGroupTasks = tasks.filter(t => t.groupId === selectedGroupId);
  const completedTasks = activeGroupTasks.filter(t => t.status === 'Done');
  const taskCompletionRate = activeGroupTasks.length > 0 ? Math.round((completedTasks.length / activeGroupTasks.length) * 100) : 0;

  // Render Sub Tabs
  return (
    <div className="space-y-6">
      {/* Title Header with Workspace Group Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-white tracking-tight">AI Collaboration Workspace</h1>
          </div>
          <p className="text-xs text-slate-400">Scale productivity from individual focus into multi-member workspace intelligence.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            id="workspace-group-selector"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setCoachReport(null);
            }}
            className="bg-[#0f0f11] text-xs text-white border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-red-500/50 transition cursor-pointer min-w-[180px]"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.category})</option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-black font-semibold text-xs hover:bg-red-400 transition"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>
      </div>

      {/* Form for Creating a New Workspace/Group */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateGroup}
            className="p-5 rounded-2xl bg-[#0b0c10] border border-white/10 space-y-4 max-w-2xl"
          >
            <h3 className="text-sm font-semibold text-white">Setup New Shared Workspace</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon Synergy, Product launch"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Workspace Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value as any)}
                  className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition"
                >
                  <option value="Project Team">Project Team</option>
                  <option value="Student Group">Student Group</option>
                  <option value="Startup Team">Startup Team</option>
                  <option value="Organization">Organization</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Brief summary of group aims, shared goals, or company scope..."
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                className="w-full h-16 bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Invite Members (Up to 5 on Free Tier)</label>
                {inviteEmails.length < 5 && (
                  <button 
                    type="button" 
                    onClick={handleAddEmail}
                    className="text-[10px] text-red-400 hover:text-red-300 font-semibold uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Email
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="teammate@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-1 bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-2.5 outline-none focus:border-red-500/50 transition"
                    />
                    {inviteEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(index)}
                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <UserCheck className="w-4 h-4 opacity-0 hidden" />
                        <span className="text-xs font-bold">X</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-4">
              <button
                type="button"
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-black font-semibold rounded-xl hover:bg-red-400 transition"
              >
                Create Workspace
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard & Analytics', icon: Activity },
          { id: 'groups', label: 'Group Members', icon: Users },
          { id: 'sprint', label: 'Sprint Board', icon: Kanban },
          { id: 'goals', label: 'Team Milestones', icon: Target },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare },
          { id: 'calls', label: 'Standups & Video', icon: Video },
          { id: 'google-sync', label: 'Google Workspace Sync', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-medium shrink-0 transition ${
                isActive 
                  ? 'border-red-500 text-white font-semibold bg-white/[0.02]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER CONTENT PANELS */}
      <div className="min-h-[480px]">
        {/* TAB 1: WORKSPACE DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Health Score and Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Team Health Score</p>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {activeGroupTasks.length > 0 ? Math.round(85 + taskCompletionRate * 0.15) : 92}/100
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                    <Activity className="w-3.5 h-3.5" /> Strong Collaboration Pace
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 flex items-center justify-center font-bold text-white text-xs select-none">
                  {activeGroupTasks.length > 0 ? Math.round(85 + taskCompletionRate * 0.15) : 92}%
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Task Completion Rate</p>
                <p className="text-3xl font-extrabold text-white mt-1">{taskCompletionRate}%</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${taskCompletionRate}%` }} />
                </div>
                <p className="text-[9px] text-slate-500 mt-2">{completedTasks.length} out of {activeGroupTasks.length} items complete</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Agile Velocity</p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {activeGroupTasks.filter(t => t.status === 'In Progress').length} in-progress
                </p>
                <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5" /> Fast sprints active
                </p>
              </div>
            </div>

            {/* Organization / Bento Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Department Analysis & Roles */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Department Analytics & Attendance</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { dept: 'Frontend UI', rate: '96%', items: '3 items', color: 'text-red-400' },
                    { dept: 'Backend/NoSQL', rate: '98%', items: '2 items', color: 'text-emerald-400' },
                    { dept: 'QA Automation', rate: '92%', items: '1 item', color: 'text-blue-400' },
                    { dept: 'Strategy/Pitch', rate: '100%', items: '1 item', color: 'text-amber-400' }
                  ].map((dept, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-medium text-slate-400">{dept.dept}</span>
                      <div className="text-lg font-bold text-white">{dept.rate}</div>
                      <span className="text-[9px] text-slate-500 block">Attendance / {dept.items}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Project Timeline Probability Status</h4>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Hackathon Phase 1 (Core Module Build)</span>
                      <span className="text-emerald-400">85% success probability</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Expected Completion: July 30, 2026</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">Low Delay Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance & Live Alerts */}
              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Live Workspace Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-xs text-red-200">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Overload Alert:</span> John is assigned to Critical items. Workload capacity exceeds 85%.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-xs text-emerald-200">
                    <UserCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Standup Complete:</span> David submitted standup report. No blockers listed today.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                    <Calendar className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Milestone Near:</span> MVP release is targeted for Friday.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GROUP MEMBERS MANAGEMENT */}
        {activeSubTab === 'groups' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member List */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Workspace Members ({activeGroup.members.length})</h3>
                <div className="divide-y divide-white/5">
                  {activeGroup.members.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
                      <div className="flex items-center gap-3">
                        <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{member.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                              member.role === 'Owner' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              member.role === 'Admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-white/5 text-slate-400 border border-white/5'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.map((skill, i) => (
                              <span key={i} className="text-[9px] font-mono bg-white/[0.04] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Workload Capacity</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${member.workload > 80 ? 'bg-red-500' : member.workload > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${member.workload}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-200">{member.workload}%</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {member.name !== user?.name && (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={member.role}
                              onChange={(e) => handleAssignRole(member.id, e.target.value as any)}
                              className="bg-[#121318] text-[10px] text-white border border-white/10 rounded px-1.5 py-1"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Member">Member</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition"
                              title="Remove member"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Form */}
              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Invite Teammates</h3>
                <form onSubmit={handleInviteMember} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Teammate Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rachel, Jack"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Assign Workspace Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Node.js, UI design, copywriting"
                      value={inviteSkills}
                      onChange={(e) => setInviteSkills(e.target.value)}
                      className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-3 outline-none focus:border-red-500/50 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Send Workspace Invite
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGILE SPRINT BOARD */}
        {activeSubTab === 'sprint' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Sprint Backlog & Boards</h3>
              <button
                onClick={() => setShowCreateTask(!showCreateTask)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-medium text-white rounded-lg hover:bg-white/10 transition"
              >
                <Plus className="w-4 h-4" /> Add Sprint Task
              </button>
            </div>

            {/* Create Task Form */}
            <AnimatePresence>
              {showCreateTask && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateTask}
                  className="p-4 rounded-xl bg-[#0b0c10] border border-white/10 space-y-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Task Title (e.g. Frontend styling)"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none focus:border-red-500/50 transition"
                      required
                    />

                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none focus:border-red-500/50 transition cursor-pointer"
                    >
                      <option value="">Choose Assignee</option>
                      {activeGroup.members.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                      <option value="Unassigned">Unassigned</option>
                    </select>

                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <input
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Short description of task objectives, dependencies, and parameters..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none focus:border-red-500/50 transition"
                  />

                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowCreateTask(false)} className="px-3 py-1.5 text-slate-300">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-red-500 text-black font-semibold rounded-lg">Save Task</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Columns (Trello-like board) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {(['Backlog', 'Todo', 'In Progress', 'Review', 'Done'] as GroupTask['status'][]).map((columnName) => {
                const columnTasks = activeGroupTasks.filter(t => t.status === columnName);
                return (
                  <div key={columnName} className="p-3 bg-[#0b0c10] border border-white/5 rounded-2xl min-w-[200px] flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">{columnName}</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-slate-400 rounded-full font-bold">{columnTasks.length}</span>
                    </div>

                    <div className="flex-1 space-y-2.5 min-h-[350px]">
                      {columnTasks.map((task) => (
                        <div key={task.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition space-y-2 relative">
                          <div className="flex justify-between items-start gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ${
                              task.priority === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              task.priority === 'high' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                              task.priority === 'medium' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                              'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                            }`}>
                              {task.priority}
                            </span>
                            <button
                              onClick={() => removeGroupTask(task.id)}
                              className="text-slate-600 hover:text-red-400 transition"
                            >
                              <LogOut className="w-3 h-3 rotate-180" />
                            </button>
                          </div>

                          <h4 className="text-xs font-semibold text-white leading-tight">{task.title}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>

                          <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5">
                            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                              <span>Assignee: <span className="text-gray-300 font-medium">{task.assignedTo}</span></span>
                              <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] font-mono">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-slate-300">{task.progress}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={task.progress}
                                onChange={(e) => updateTaskProgressLevel(task.id, parseInt(e.target.value))}
                                className="w-full accent-red-500 h-1 rounded bg-white/5 cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Quick movement selectors */}
                          <div className="flex justify-between items-center border-t border-white/5 pt-1.5 mt-1.5">
                            <button
                              onClick={() => moveTaskStatus(task.id, 'backward')}
                              disabled={columnName === 'Backlog'}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500"
                            >
                              &larr;
                            </button>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Move</span>
                            <button
                              onClick={() => moveTaskStatus(task.id, 'forward')}
                              disabled={columnName === 'Done'}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500"
                            >
                              &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TEAM GOALS & TRACKING */}
        {activeSubTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Workspace Goals</h3>
              <button
                onClick={() => setShowCreateGoal(!showCreateGoal)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-medium text-white rounded-lg hover:bg-white/10 transition"
              >
                <Plus className="w-4 h-4" /> Create Workspace Goal
              </button>
            </div>

            {/* Create Goal Form */}
            <AnimatePresence>
              {showCreateGoal && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleCreateGoal}
                  className="p-4 rounded-xl bg-[#0b0c10] border border-white/10 space-y-3.5 max-w-xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400">Goal Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Hackathon MVP"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        className="w-full bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400">Target Date</label>
                      <input
                        type="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                        className="w-full bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400">Milestones (Add key benchmarks)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Database schema ready"
                        value={goalMilestone}
                        onChange={(e) => setGoalMilestone(e.target.value)}
                        className="flex-1 bg-[#121318] text-xs text-white rounded-lg border border-white/5 p-2 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddMilestoneInput}
                        className="px-3 bg-white/5 border border-white/10 text-xs text-white rounded-lg hover:bg-white/10"
                      >
                        Add
                      </button>
                    </div>
                    {goalMilestones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {goalMilestones.map((ms, idx) => (
                          <span key={idx} className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full">{ms}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-2">
                    <button type="button" onClick={() => setShowCreateGoal(false)} className="px-3 py-1.5 text-slate-300">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-red-500 text-black font-semibold rounded-lg">Create Goal</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.filter(g => g.groupId === selectedGroupId).map((g) => (
                <div key={g.id} className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{g.title}</h4>
                      <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Target Date: {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveGoal(g.id)}
                      className="text-slate-600 hover:text-red-400 transition"
                    >
                      <LogOut className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Overall Benchmark Completion</span>
                      <span className="text-white font-bold">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${g.progress}%` }} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={g.progress}
                      onChange={(e) => handleUpdateGoalProgress(g.id, parseInt(e.target.value))}
                      className="w-full accent-red-500 h-1 bg-white/5 rounded cursor-pointer mt-1"
                    />
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Milestone Benchmarks</span>
                    <ul className="space-y-1.5">
                      {g.milestones.map((ms, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-slate-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${g.progress >= ((index + 1) * (100 / g.milestones.length)) ? 'bg-red-500' : 'bg-white/20'}`} />
                          <span className={g.progress >= ((index + 1) * (100 / g.milestones.length)) ? 'line-through text-slate-500' : ''}>{ms}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REAL-TIME TEAM CHAT */}
        {activeSubTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[minmax(150px,auto)_1fr] md:grid-rows-1 gap-4 bg-[#08080a] rounded-2xl border border-white/5 overflow-hidden h-[800px] md:h-[600px]">
            {/* Left Channel Sidebar */}
            <div className="p-4 border-r border-white/5 flex flex-col gap-4 bg-[#0a0a0c] overflow-y-auto min-h-0">
              <div>
                <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2.5">Channels</h4>
                <div className="space-y-1">
                  {channels.filter(c => c.groupId === selectedGroupId).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChannelId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition ${
                        selectedChannelId === c.id 
                          ? 'bg-white/5 text-white font-semibold border border-white/10' 
                          : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      # {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2.5">Teammate DMs</h4>
                <div className="space-y-1">
                  {activeGroup.members.filter(m => m.name !== (user?.name || 'Sarah')).map((m) => (
                    <button
                      key={m.id}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/[0.02] hover:text-white flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[9px] text-red-200">
                <span className="font-semibold block text-red-400 mb-1">💡 Pro-Tip</span>
                Type <code className="text-white font-bold select-all bg-[#121318] px-1 rounded">@AI</code> followed by commands like <code className="text-white">summarize discussion</code>, <code className="text-white">generate action items</code> or <code className="text-white">create sprint plan</code>!
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="md:col-span-3 flex flex-col h-full bg-[#050505] relative min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#070709]">
                <div>
                  <h4 className="text-xs font-semibold text-white"># {activeChannel.name}</h4>
                  <p className="text-[9px] text-slate-500">Real-time collaborative team chat</p>
                </div>

                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={handleFileShare}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] flex items-center gap-1 font-semibold"
                    title="Send file asset"
                  >
                    📁 Share Doc
                  </button>
                  <button
                    onClick={handleVoiceNoteClick}
                    className={`p-1.5 rounded ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-slate-300'} text-[10px] flex items-center gap-1 font-semibold`}
                    title={isRecording ? "Stop recording" : "Record voice message"}
                  >
                    {isRecording ? `⏹️ Recording (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})` : '🎙️ Voice Note'}
                  </button>
                </div>
              </div>

              {/* Messages Lists */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.filter(m => m.channelId === selectedChannelId).map((msg) => (
                  <div key={msg.id} className="flex gap-3 items-start group">
                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-8.5 h-8.5 rounded-full object-cover border border-white/10" />
                    <div className="space-y-1 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{msg.senderName}</span>
                        {msg.isAI && <span className="px-1 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-bold uppercase tracking-wider">AI Assistant</span>}
                        <span className="text-[8px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                      
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.isAI 
                          ? 'bg-red-500/5 border border-red-500/10 text-slate-200 font-medium' 
                          : 'bg-white/[0.02] border border-white/5 text-slate-300'
                      }`}>
                        {/* Render standard text, attachments, or audios */}
                        {msg.attachment ? (
                          <div className="space-y-2">
                            <span className="block text-[11px] font-medium text-slate-100">{msg.content}</span>
                            <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/10 rounded-xl max-w-sm select-none">
                              <FileText className="w-5 h-5 text-red-400" />
                              <div>
                                <p className="text-[10px] text-white font-medium">{msg.attachment.name}</p>
                                <p className="text-[8px] text-slate-500 font-mono">{msg.attachment.size} • {msg.attachment.type}</p>
                              </div>
                            </div>
                          </div>
                        ) : msg.audioDuration ? (
                          <div className="space-y-2">
                            <span className="block text-[11px] font-medium text-slate-100">{msg.content}</span>
                            <div className="flex items-center gap-2.5 p-2 bg-white/[0.02] border border-white/10 rounded-xl w-48">
                              <Play className="w-4 h-4 text-red-400 cursor-pointer fill-red-400/20" />
                              <div className="flex-1 bg-white/10 h-1.5 rounded-full relative">
                                <div className="absolute left-0 top-0 h-full bg-red-500 w-1/3 rounded-full" />
                              </div>
                              <span className="text-[8px] text-slate-400 font-mono">{msg.audioDuration}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Emoji Reactions */}
                      <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {['👍', '🔥', '🚀', '🧠'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="p-1 rounded hover:bg-white/10 text-[10px] transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Display existing Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1 pt-1 flex-wrap">
                          {msg.reactions.map((r, idx) => (
                            <button
                              key={idx}
                              onClick={() => addReaction(msg.id, r.emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] ${
                                r.users.includes('User') 
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400 font-semibold' 
                                  : 'bg-white/5 border-white/5 text-slate-400'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span>{r.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 items-start">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop" alt="AI Manager" className="w-8.5 h-8.5 rounded-full object-cover border border-white/10" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white">AI Manager</span>
                      <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-2xl flex items-center gap-1.5 text-slate-400 text-xs">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span>AI thinking... compiling commands</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#070709] flex gap-2">
                <input
                  type="text"
                  placeholder={`Message #${activeChannel.name}... Tag @AI for dynamic assistance`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 bg-[#121318] text-xs text-white rounded-xl border border-white/5 px-4 py-3 outline-none focus:border-red-500/50 transition"
                  required
                />
                <button
                  type="submit"
                  className="px-4 bg-red-500 text-black rounded-xl hover:bg-red-400 font-bold transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: WEBRTC CALL SIMULATOR & MEETINGS SUMMARIZER */}
        {activeSubTab === 'calls' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Call Controls and Video Stage */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">WebRTC High Fidelity Call Stage</h3>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 uppercase font-bold tracking-tight">Active Room</span>
                </div>

                {!callActive ? (
                  <div className="h-[320px] rounded-2xl bg-[#050505] border border-white/5 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <Video className="w-12 h-12 text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-white">Assemble the Team Room</p>
                      <p className="text-xs text-gray-400 max-w-sm mt-1">Initialize WebRTC voice or video calls with complete media layouts, audio notes compilation, and screen capture tools.</p>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold">
                      <button
                        onClick={() => startCall('video')}
                        className="px-4 py-2.5 rounded-xl bg-red-500 text-black hover:bg-red-400 flex items-center gap-1.5 transition"
                      >
                        <Video className="w-4 h-4" />
                        Join Realtime Video/Voice Call
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <RealtimeCall roomId={activeGroup.id} onLeave={() => setCallActive(false)} />
                  </div>
                )}
              </div>

              {/* Standup Automation Assistant */}
              <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Daily Standup Bot</h3>
                  <button
                    onClick={() => {
                      setShowStandupModal(true);
                      setStandupResult(null);
                    }}
                    className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-400 rounded-lg hover:bg-red-500/20 transition"
                  >
                    Open Standup Form
                  </button>
                </div>

                {!standupResult ? (
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Trigger the Daily Standup process! AI gathers yesterday's, today's, and blocker responses to compile a formatted markdown standup report with Scrum Master risk diagnostics.
                  </p>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 max-h-[300px] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Compiled Report</span>
                      <button onClick={() => setStandupResult(null)} className="text-slate-500 hover:text-white text-[9px]">&times; Clear</button>
                    </div>
                    <div className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{standupResult}</div>
                  </div>
                )}
              </div>
            </div>

            {/* AI MEETING NOTE AUTO-TASKER */}
            <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Meeting Notes Generator</h3>
                <button
                  onClick={loadPrepopulatedMeetingTranscript}
                  className="text-[9px] text-red-400 hover:underline"
                >
                  Load Demo Sync
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase tracking-wider">Meeting Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Roadmap Sync"
                    value={meetingNotesTitle}
                    onChange={(e) => setMeetingNotesTitle(e.target.value)}
                    className="w-full bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase tracking-wider">Transcript / Meeting Outline</label>
                  <textarea
                    placeholder="Paste meeting conversation, speaker logs, or simple action list... AI will analyze topics, assignees, priorities, and deadlines."
                    value={meetingNotesTranscript}
                    onChange={(e) => setMeetingNotesTranscript(e.target.value)}
                    className="w-full h-28 bg-[#121318] text-xs text-white rounded-xl border border-white/5 p-2.5 outline-none resize-none focus:border-red-500/50 transition font-sans"
                  />
                </div>

                <button
                  onClick={handleMeetingSummarize}
                  disabled={summarizerLoading || !meetingNotesTranscript.trim()}
                  className="w-full py-2.5 rounded-xl bg-red-500 text-black font-semibold hover:bg-red-400 text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-45"
                >
                  <Sparkles className="w-4 h-4" />
                  {summarizerLoading ? 'Summarizing & Creating Tasks...' : 'Convert Meeting into Backlog Tasks'}
                </button>

                {summarizerResult && (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3.5 max-h-[350px] overflow-y-auto">
                    <div>
                      <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">AI Executive Summary</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{summarizerResult.summary}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Key Decisions</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">{summarizerResult.decisions}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Auto-Created Backlog Tasks</h4>
                      <div className="space-y-1.5 mt-1.5">
                        {summarizerResult.suggestedTasks?.map((t: any, i: number) => (
                          <div key={i} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center gap-3">
                            <div>
                              <p className="text-[11px] font-bold text-white">{t.title}</p>
                              <p className="text-[9px] text-slate-500">Assignee: {t.assignedTo || 'Unassigned'} • Due in {t.daysToDeadline || 3} days</p>
                            </div>
                            <span className="text-[8px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">{t.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AI RISK COACH & REALLOCATOR */}
        {activeSubTab === 'coach' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-red-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Agile Coach Analysis</h3>
                </div>
                <button
                  onClick={fetchCoachAnalysis}
                  disabled={coachLoading}
                  className="text-[10px] font-semibold text-red-400 hover:underline"
                >
                  {coachLoading ? 'Auditing team stats...' : '🔄 Run Dynamic Audit'}
                </button>
              </div>

              {coachLoading && (
                <div className="py-12 text-center space-y-2">
                  <Cpu className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Gemini is evaluating task distribution patterns, goal deadlines, and capacity logs...</p>
                </div>
              )}

              {coachReport && !coachLoading && (
                <div className="space-y-6">
                  {/* Health and Deadline Predictions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">AI Deadline Risk Prediction</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Project Success Probability:</span>
                        <span className="text-lg font-extrabold text-emerald-400">{coachReport.delayPredictions?.successProbability || 85}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Expected Completion:</span>
                        <span className="text-white font-semibold">{coachReport.delayPredictions?.expectedCompletion || 'July 30'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Risk Severity Level:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          coachReport.delayPredictions?.riskLevel === 'Critical' || coachReport.delayPredictions?.riskLevel === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                          coachReport.delayPredictions?.riskLevel === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`}>{coachReport.delayPredictions?.riskLevel || 'Low'}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{coachReport.delayPredictions?.explanation}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Burnout & Overload Report</span>
                      {coachReport.burnoutAlerts && coachReport.burnoutAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {coachReport.burnoutAlerts.map((alert: any, idx: number) => (
                            <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-200">
                              <span className="font-bold text-white">{alert.memberName}:</span> {alert.alert}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-400 leading-relaxed">No member is currently overloaded. Sprints are well aligned!</p>
                      )}
                    </div>
                  </div>

                  {/* Smart Team Balancer Recommendation */}
                  <div className="p-4 rounded-xl bg-[#08080a] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">Smart Team Balancer</h4>
                        <p className="text-[9px] text-slate-500">Gemini recommends task reallocations to lower burnout and increase speed.</p>
                      </div>
                      <button
                        onClick={handleSmartBalanceRedistribution}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-black font-semibold text-[10px] rounded-lg transition"
                      >
                        Accept & Redistribute Sprints
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {coachReport.balancerSuggestions?.map((s: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col sm:flex-row justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-white">{s.taskTitle}</span>
                            <span className="text-[10px] text-slate-500 block">Reasoning: {s.reason}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase">Suggested Assignee</span>
                            <span className="text-emerald-400 font-bold block">{s.suggestedAssignee}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Coach Tips */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Agile Coach Insights</span>
                    <ul className="space-y-2">
                      {coachReport.coachingSuggestions?.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-red-500 shrink-0 select-none mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!coachReport && !coachLoading && (
                <div className="py-12 text-center">
                  <p className="text-xs text-slate-500">Click &quot;Run Dynamic Audit&quot; to prompt Gemini to compile deep sprint timeline risks and workload recommendations.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: GOOGLE WORKSPACE SYNC HUB */}
        {activeSubTab === 'google-sync' && (
          <GoogleSyncHub />
        )}
      </div>

      {/* DAILY STANDUP FORM MODAL */}
      <AnimatePresence>
        {showStandupModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 bg-[#0c0c0e] border border-white/10 rounded-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h4 className="text-sm font-semibold text-white">Daily Standup Prompt</h4>
                <button onClick={() => setShowStandupModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
              </div>

              <form onSubmit={handleStandupSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">1. What did you complete yesterday?</label>
                  <textarea
                    placeholder="Completed building the MongoDB local model connection wrappers and tested status endpoints..."
                    value={standupYesterday}
                    onChange={(e) => setStandupYesterday(e.target.value)}
                    className="w-full h-16 bg-[#121318] rounded-xl border border-white/5 p-2.5 outline-none text-white resize-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">2. What will you do today?</label>
                  <textarea
                    placeholder="Align the Agile sprint layout grid and prepare mock data records..."
                    value={standupToday}
                    onChange={(e) => setStandupToday(e.target.value)}
                    className="w-full h-16 bg-[#121318] rounded-xl border border-white/5 p-2.5 outline-none text-white resize-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">3. Any blockers?</label>
                  <textarea
                    placeholder="None, though John's high capacity workload might delay the responsive grid slightly..."
                    value={standupBlockers}
                    onChange={(e) => setStandupBlockers(e.target.value)}
                    className="w-full h-16 bg-[#121318] rounded-xl border border-white/5 p-2.5 outline-none text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStandupModal(false)}
                    className="px-4 py-2 border border-white/10 rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-black font-semibold rounded-xl"
                  >
                    {standupLoading ? 'Analyzing Standup...' : 'Compile Standup Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
