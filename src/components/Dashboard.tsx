import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  BrainCircuit, 
  Zap, 
  Flame, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  ShieldAlert,
  HeartPulse,
  Users,
  FileCode,
  Mail,
  MessageSquare,
  BellRing
} from 'lucide-react';
import { ALL_MOCK_BADGES } from '../lib/mockData';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    tasks, 
    habits, 
    dailyPlan, 
    report, 
    setActiveTab, 
    generateTodayPlan, 
    toggleTaskStatus,
    triggerDeadlineRescue,
    triggerProcrastinationAnalysis,
    unlockBadge,
    simulateReminderAlert
  } = useApp();

  const [loadingPlan, setLoadingPlan] = React.useState(false);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      await generateTodayPlan();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleShare = (platform: 'linkedin' | 'facebook' | 'whatsapp', badge: any) => {
    const appUrl = window.location.href;
    const text = `🏆 Achievement Unlocked! I just earned the '${badge.name}' badge on Last Minute Life Saver AI! 🚀\n"${badge.description}"\nRescue your schedules and track your performance here:`;
    
    let shareUrl = '';
    if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(text)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + appUrl)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Find critical tasks & stats
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const criticalTasks = pendingTasks.filter((t) => t.riskLevel === 'critical' || t.riskLevel === 'high');
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  
  // Calculate general risk level of user's active board
  const riskPercent = pendingTasks.length > 0 
    ? Math.round((criticalTasks.length / pendingTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/5 relative overflow-hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            {criticalTasks.length > 0 
              ? `You have ${criticalTasks.length} deadlines at severe risk today. Let's finish them.` 
              : "All clear! No critical deadline risks currently detected."}
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            id="capture-task-dash-btn"
            onClick={() => setActiveTab('tasks')}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium text-xs shadow-lg shadow-red-500/10 hover:opacity-95 transition"
          >
            Capture Task
          </button>
          <button 
            id="talk-ai-coach-dash-btn"
            onClick={() => setActiveTab('reports')}
            className="px-4.5 py-2.5 rounded-xl bg-gray-800 text-white font-medium text-xs border border-gray-700/50 hover:bg-gray-750 transition"
          >
            Talk to Coach
          </button>
        </div>
      </div>

      {/* Grid of Key Analytical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-medium">Productivity Score</span>
              <div className="font-display text-2xl font-bold text-white">{user?.productivityScore || 75}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
            <span>+3% from yesterday</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-medium">Deadline Risk Index</span>
              <div className="font-display text-2xl font-bold text-white">{riskPercent}%</div>
            </div>
            <div className={`p-2.5 rounded-lg ${riskPercent > 50 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-[10px] text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${riskPercent > 50 ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} />
            <span>{criticalTasks.length} urgent task alerts active</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-medium">Completed Tasks</span>
              <div className="font-display text-2xl font-bold text-white">{completedCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-[10px] text-gray-400">
            <span>Total of {tasks.length} tasks registered</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-medium">Active Habit Streaks</span>
              <div className="font-display text-2xl font-bold text-white">
                {habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0} Days
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-[10px] text-gray-400">
            <span>Across {habits.length} tracked routines</span>
          </div>
        </div>
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Mission planner + Critical Deadlines) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Today's Mission Scheduler */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4.5 h-4.5 text-orange-400" />
                <h3 className="font-display font-bold text-white text-base">Today's Mission</h3>
              </div>
              <button 
                id="generate-plan-dash-btn"
                onClick={handleGeneratePlan}
                disabled={loadingPlan}
                className="flex items-center space-x-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPlan ? 'animate-spin' : ''}`} />
                <span>{dailyPlan ? 'Reschedule' : 'Generate Daily Plan'}</span>
              </button>
            </div>

            {loadingPlan ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400 font-mono">Gemini AI is scheduling your day...</span>
              </div>
            ) : dailyPlan ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 text-[10px] text-gray-500 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                  <div className="col-span-1">Time slot</div>
                  <div className="col-span-3">Mission item</div>
                  <div className="col-span-1 text-right">Hours</div>
                </div>
                <div className="divide-y divide-white/5">
                  {dailyPlan.tasks.map((slot, idx) => (
                    <div key={idx} className="grid grid-cols-5 py-3 text-xs items-center hover:bg-white/[0.01] transition">
                      <div className="col-span-1 font-mono text-orange-400 font-medium">{slot.time}</div>
                      <div className="col-span-3 text-gray-200 font-medium">{slot.taskTitle}</div>
                      <div className="col-span-1 text-right font-mono text-gray-400">{slot.durationHours}h</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px] text-gray-400">
                  <span>Total Planned Focus Time</span>
                  <span className="font-mono font-bold text-white text-xs">{dailyPlan.focusHours} Hours</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3.5">
                <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
                  You haven't generated today's timeline yet. Let Gemini calculate a burnout-free mission map based on your pending tasks.
                </p>
                <button 
                  id="generate-plan-dash-empty-btn"
                  onClick={handleGeneratePlan}
                  className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-xs hover:bg-orange-500/15 transition"
                >
                  Generate Mission Map
                </button>
              </div>
            )}
          </div>

          {/* Section: Critical Deadlines at Risk */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
              <h3 className="font-display font-bold text-white text-base">Critical Deadlines at Risk</h3>
            </div>

            {criticalTasks.length > 0 ? (
              <div className="space-y-4">
                {criticalTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 space-y-3.5 relative overflow-hidden group hover:border-red-500/30 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-red-400 font-mono font-semibold uppercase tracking-wider">
                          Critical risk (Score: {task.riskScore})
                        </span>
                        <h4 className="font-display font-bold text-white text-sm sm:text-base leading-snug">
                          {task.title}
                        </h4>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-gray-400">Due:</span>
                        <div className="font-mono text-white font-medium mt-0.5">
                          {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-red-500/10">
                      <div className="text-gray-400">
                        Remaining Work: <span className="font-mono text-white font-semibold">{task.estimatedHours - task.completedHours}h</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          id={`rescue-dash-btn-${task.id}`}
                          onClick={() => {
                            triggerDeadlineRescue(task.id);
                            setActiveTab('tasks');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 font-semibold hover:bg-red-500/25 transition text-[11px]"
                        >
                          Activate Rescue Mode
                        </button>
                        <button 
                          id={`complete-dash-btn-${task.id}`}
                          onClick={() => toggleTaskStatus(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition text-[11px]"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No active critical risks detected. Keep doing great work!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (AI Coaching, Habits, Predictions) */}
        <div className="space-y-6">
          
          {/* Section: AI Coach Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              <h3 className="font-display font-bold text-white text-base">AI Coach Analysis</h3>
            </div>

            {report ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Weekly Performance Score</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                    {report.score} / 100
                  </span>
                </div>
                
                <div className="space-y-2 pb-2">
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Top Recommendation</div>
                  <p className="text-gray-300 text-xs leading-relaxed italic bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    "{report.suggestions[0]}"
                  </p>
                </div>

                <button 
                  id="full-report-dash-btn"
                  onClick={() => setActiveTab('reports')}
                  className="w-full py-2.5 rounded-xl bg-gray-800 text-white font-medium text-xs border border-gray-750/80 hover:bg-gray-750 transition flex items-center justify-center space-x-1.5"
                >
                  <span>View Full Performance Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-xs leading-relaxed mb-3">
                  Your AI performance report is ready to be compiled.
                </p>
                <button 
                  id="compile-report-dash-btn"
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition"
                >
                  Compile Performance Report
                </button>
              </div>
            )}
          </div>

          {/* Section: Procrastination Warnings & Predictions */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-4.5 h-4.5 text-violet-400" />
              <h3 className="font-display font-bold text-white text-base">Procrastination Warnings</h3>
            </div>

            {pendingTasks.some(t => t.procrastinationAnalysis) ? (
              <div className="space-y-4">
                {pendingTasks.filter(t => t.procrastinationAnalysis).slice(0, 1).map(task => (
                  <div key={task.id} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-200">{task.title}</div>
                    <div className="space-y-1 bg-violet-500/5 border border-violet-500/15 p-3 rounded-lg">
                      <span className="text-[10px] font-mono text-violet-400 font-semibold uppercase">Predicted Root Friction</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        {task.procrastinationAnalysis?.rootCause}
                      </p>
                    </div>
                    <div className="space-y-1 bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                      <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase">Bypass Strategy</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        {task.procrastinationAnalysis?.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2.5">
                <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                  No procrastination patterns currently isolated. We will watch for postponed or delayed tasks.
                </p>
                {pendingTasks.length > 0 && (
                  <button 
                    id="analyze-procrastinate-dash-btn"
                    onClick={() => triggerProcrastinationAnalysis(pendingTasks[0].id)}
                    className="px-3.5 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/15 transition"
                  >
                    Run Procrastination Diagnostic
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Simple Custom SVG charts */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3.5">
            <h3 className="font-display font-bold text-white text-sm">Productivity Sprints</h3>
            <div className="w-full h-32 flex items-end justify-between px-2 pt-4">
              {[45, 60, 30, 80, 55, 90, 75].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 w-[10%]">
                  <div className="relative w-full bg-gray-800 rounded-md overflow-hidden h-20">
                    <div 
                      className={`absolute bottom-0 w-full rounded-md bg-gradient-to-t ${i === 5 ? 'from-orange-500 to-amber-400' : 'from-blue-600 to-indigo-400'}`}
                      style={{ height: `${val}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-gray-400 text-center">Focus Intensity curve (Last 7 Days)</div>
          </div>
          
        </div>

        {/* Full-width Achievements & 1-Hour Pre-alert monitoring suite */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 col-span-full">
          {/* Unlocked Achievements & Badges Panel */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">Unlocked Achievements</h3>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                {user?.badges?.length || 0} / {ALL_MOCK_BADGES.length} EARNED
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-normal">
              Earn high-contrast credentials badges by completing critical tasks on-time, maintaining strict habits, or initiating rescue recovery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-h-[340px] overflow-y-auto pr-1">
              {ALL_MOCK_BADGES.map((badge) => {
                const isUnlocked = user?.badges?.includes(badge.id) || false;
                
                return (
                  <div 
                    key={badge.id}
                    onClick={() => {
                      if (!isUnlocked) {
                        unlockBadge(badge.id);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition flex items-start gap-3 select-none cursor-pointer ${
                      isUnlocked 
                        ? 'bg-amber-500/[0.03] border-amber-500/20 hover:bg-amber-500/[0.06] shadow-lg shadow-amber-500/5' 
                        : 'bg-black/20 border-white/5 opacity-45 hover:opacity-70 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isUnlocked 
                        ? 'bg-amber-500/15 border border-amber-500/20 text-amber-400' 
                        : 'bg-slate-800/30 border border-transparent text-slate-500'
                    }`}>
                      {badge.icon === 'ShieldAlert' && <ShieldAlert className="w-4.5 h-4.5 text-red-400" />}
                      {badge.icon === 'Zap' && <Zap className="w-4.5 h-4.5 text-amber-400" />}
                      {badge.icon === 'HeartPulse' && <HeartPulse className="w-4.5 h-4.5 text-rose-400" />}
                      {badge.icon === 'Flame' && <Flame className="w-4.5 h-4.5 text-orange-500" />}
                      {badge.icon === 'BrainCircuit' && <BrainCircuit className="w-4.5 h-4.5 text-violet-400" />}
                      {badge.icon === 'FileCode' && <FileCode className="w-4.5 h-4.5 text-cyan-400" />}
                      {badge.icon === 'Users' && <Users className="w-4.5 h-4.5 text-emerald-400" />}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">{badge.name}</span>
                        {isUnlocked && (
                          <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 rounded animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">{badge.description}</p>
                      
                      {isUnlocked && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 mt-2">
                          <span className="text-[8px] text-slate-500 font-mono font-semibold uppercase tracking-wider">Share:</span>
                          <div className="flex items-center gap-1">
                            {/* LinkedIn Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare('linkedin', badge);
                              }}
                              className="p-1 bg-white/[0.02] hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 rounded text-slate-400 hover:text-sky-400 transition cursor-pointer"
                              title="Share Badge on LinkedIn"
                            >
                              <LinkedinIcon className="w-3 h-3" />
                            </button>
                            {/* Facebook Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare('facebook', badge);
                              }}
                              className="p-1 bg-white/[0.02] hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded text-slate-400 hover:text-blue-400 transition cursor-pointer"
                              title="Share Badge on Facebook"
                            >
                              <FacebookIcon className="w-3 h-3" />
                            </button>
                            {/* WhatsApp Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare('whatsapp', badge);
                              }}
                              className="p-1 bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                              title="Share Badge to WhatsApp Status"
                            >
                              <WhatsappIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1-Hour Prior Reminders Simulator Panel */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="font-display font-bold text-white text-base">1-Hour Pre-alert Simulator</h3>
            </div>

            <p className="text-xs text-gray-400 leading-normal">
              Active configuration for sending urgent heads-up reminders exactly 1 hour before task deadlines to your designated channels.
            </p>

            {/* Target Selection & Action triggers */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold uppercase text-slate-400 block">Select Active Task to Test Alert:</label>
                <select 
                  id="target-reminder-task"
                  className="w-full text-xs bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500/50"
                  defaultValue={pendingTasks[0]?.id || ""}
                >
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} (due: {new Date(t.deadline).toLocaleDateString()})</option>
                    ))
                  ) : (
                    <option value="" disabled>No active tasks found</option>
                  )}
                </select>
              </div>

              {/* Simulation triggers layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    const selectEl = document.getElementById('target-reminder-task') as HTMLSelectElement;
                    const taskId = selectEl?.value;
                    const task = tasks.find(t => t.id === taskId) || pendingTasks[0];
                    if (task) {
                      simulateReminderAlert(task.title, 'email');
                    }
                  }}
                  disabled={pendingTasks.length === 0}
                  className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/15 text-red-400 font-semibold rounded-xl border border-red-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  Email (1 hr)
                </button>

                <button
                  onClick={() => {
                    const selectEl = document.getElementById('target-reminder-task') as HTMLSelectElement;
                    const taskId = selectEl?.value;
                    const task = tasks.find(t => t.id === taskId) || pendingTasks[0];
                    if (task) {
                      simulateReminderAlert(task.title, 'sms');
                    }
                  }}
                  disabled={pendingTasks.length === 0}
                  className="py-2.5 px-3 bg-orange-500/10 hover:bg-orange-500/15 text-orange-400 font-semibold rounded-xl border border-orange-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  SMS (1 hr)
                </button>

                <button
                  onClick={() => {
                    const selectEl = document.getElementById('target-reminder-task') as HTMLSelectElement;
                    const taskId = selectEl?.value;
                    const task = tasks.find(t => t.id === taskId) || pendingTasks[0];
                    if (task) {
                      simulateReminderAlert(task.title, 'push');
                    }
                  }}
                  disabled={pendingTasks.length === 0}
                  className="py-2.5 px-3 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 font-semibold rounded-xl border border-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <BellRing className="w-4 h-4 text-blue-400" />
                  Web Push (1 hr)
                </button>
              </div>

              {/* Status footer for settings sync */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between text-[11px] text-gray-400">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-200">Pre-alert Status:</span>
                  <p>Reminders will fire automatically 1h before deadline.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="text-red-400 font-semibold hover:underline bg-transparent border-none shrink-0"
                >
                  Edit Channels
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Inline platform SVG icons for dependency isolation
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
