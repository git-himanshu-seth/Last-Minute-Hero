import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  Play, 
  Plus, 
  ShieldAlert, 
  Clock, 
  BrainCircuit, 
  Calendar, 
  HelpCircle, 
  Search,
  Upload,
  Mic,
  Camera,
  AlertCircle,
  Volume2,
  VolumeX,
  Zap,
  Award,
  X
} from 'lucide-react';
import { Task } from '../types';
import { AiPolishButton } from './AiPolishButton';

export const Tasks: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTaskStatus, 
    toggleSubtaskStatus, 
    removeTask, 
    updateTaskProgress,
    triggerDeadlineRescue,
    triggerProcrastinationAnalysis,
    triggerTaskBreakdown
  } = useApp();

  const [text, setText] = useState('');
  const [loadingCapture, setLoadingCapture] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Sprint Focus state
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(1500); // 25 mins
  const [isSprintRunning, setIsSprintRunning] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  
  // Simulated Voice / Image Upload states
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [audioRecording, setAudioRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoadingCapture(true);
    try {
      await addTask(text, mediaFile || undefined);
      setText('');
      setMediaFile(null);
    } catch (err: any) {
      alert(err.message || 'Capture failed');
    } finally {
      setLoadingCapture(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sprint countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isSprintRunning && sprintTimeLeft > 0) {
      interval = setInterval(() => {
        setSprintTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (sprintTimeLeft === 0) {
      setIsSprintRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSprintRunning, sprintTimeLeft]);

  const formatSprintTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const simulateVoiceInput = () => {
    setAudioRecording(true);
    setTimeout(() => {
      setText("Prepare MERN Interview this weekend, needs at least 8 hours of deep study on routing, db, and state");
      setAudioRecording(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-primary-text tracking-tight">AI Task Manager</h2>
        <p className="text-secondary-text text-xs sm:text-sm">Capture tasks via natural language, screenshots, or voice. AI takes care of planning, breakdown, and rescue.</p>
      </div>

      {/* Capture Input Panel */}
      <div className="glass-panel p-5.5 rounded-2xl border-border-main space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Multimodal Capture Engine</span>
        </div>

        <form onSubmit={handleTextCapture} className="space-y-3.5">
          <div className="relative">
            <textarea
              id="capture-task-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Submit DBMS assignment next Friday before 5pm. Needs about 6 hours."
              rows={3}
              className="w-full bg-surface border border-border-main rounded-xl px-4 py-3 text-sm text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent/50 resize-none transition"
            />
            
            <div className="absolute bottom-3.5 right-3.5 flex items-center space-x-2">
              {/* Image Upload Trigger */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                id="media-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg border hover:bg-white/[0.04] transition ${mediaFile ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' : 'text-secondary-text bg-surface border-border-main'}`}
                title="Attach Syllabus or Bill Screenshot"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Simulated Audio Voice Input */}
              <button 
                type="button"
                id="voice-input-btn"
                onClick={simulateVoiceInput}
                className={`p-2 rounded-lg border hover:bg-white/[0.04] transition ${audioRecording ? 'text-red-400 bg-red-500/10 border-red-500/25 animate-pulse' : 'text-secondary-text bg-surface border-border-main'}`}
                title="Record Voice Command"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* AI Grammar Polisher Button */}
              <AiPolishButton 
                text={text} 
                onPolish={setText} 
                className="p-2 border border-border-main bg-surface text-accent"
                tooltipText="Polish grammar before capturing"
              />
            </div>
          </div>

          {mediaFile && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400">
              <span className="truncate">Image loaded (Syllabus/Receipt detected)</span>
              <button 
                type="button" 
                onClick={() => setMediaFile(null)} 
                className="text-secondary-text hover:text-primary-text font-bold"
              >
                Remove
              </button>
            </div>
          )}

          {audioRecording && (
            <div className="flex items-center space-x-2 text-xs text-red-400 font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Simulating microphone capture... Listening...</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              id="capture-task-submit"
              type="submit"
              disabled={loadingCapture || !text.trim()}
              className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-xs shadow-lg shadow-accent/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {loadingCapture ? "AI Analyzing details..." : "Capture with AI"}
            </button>
          </div>
        </form>
      </div>

      {/* Workspace Management (Search and List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <input
              id="task-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-secondary-bg border border-border-main rounded-xl pl-9 pr-4 py-2.5 text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent/30 transition"
            />
          </div>

          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${selectedTask?.id === task.id ? 'bg-white/[0.04] border-accent/40 shadow-lg' : 'bg-white/[0.01] border-border-main hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start space-x-3">
                      <button 
                        id={`complete-task-btn-${task.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id);
                        }}
                        className={`mt-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 hover:border-emerald-500'}`}
                      >
                        {task.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <div className="space-y-1">
                        <h4 className={`font-display font-semibold text-sm sm:text-base ${task.status === 'completed' ? 'text-secondary-text line-through' : 'text-primary-text'}`}>
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-secondary-text uppercase font-mono font-bold tracking-wider bg-white/[0.03] px-1.5 py-0.5 rounded border border-border-main">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-secondary-text">Due:</div>
                      <div className="font-mono text-primary-text font-medium mt-0.5">
                        {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-secondary-text text-xs">
                No tasks match your search query. Try adding a new task!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Task Details and Rescue diagnostics */}
        <div>
          {selectedTask ? (
            <div className="glass-panel p-5.5 rounded-2xl border-border-main space-y-5">
              <div className="flex justify-between items-start">
                <h3 className="font-display font-bold text-primary-text text-base truncate pr-2">Task Diagnostics</h3>
                <button 
                  id={`delete-task-btn-${selectedTask.id}`}
                  onClick={() => {
                    removeTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="p-1.5 rounded-lg text-secondary-text hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete Task"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="font-display font-bold text-primary-text text-sm sm:text-base leading-snug">
                  {selectedTask.title}
                </div>
                {selectedTask.description && (
                  <p className="text-secondary-text text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 pt-2 border-t border-border-main">
                <div className="flex justify-between items-center text-xs text-secondary-text">
                  <span>Completed Effort:</span>
                  <span className="font-mono text-primary-text font-medium">{selectedTask.completedHours}h / {selectedTask.estimatedHours}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="0" 
                    max={selectedTask.estimatedHours} 
                    step="0.5"
                    value={selectedTask.completedHours}
                    onChange={(e) => updateTaskProgress(selectedTask.id, parseFloat(e.target.value) - selectedTask.completedHours)}
                    className="w-full h-1.5 bg-secondary-bg rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {/* Critical diagnostics block */}
              <div className="space-y-3.5 pt-3 border-t border-border-main">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary-text">Deadline Risk Level:</span>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedTask.riskLevel === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                    selectedTask.riskLevel === 'high' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                    'text-accent bg-accent/10 border-accent/20'
                  }`}>
                    {selectedTask.riskLevel}
                  </span>
                </div>

                {/* Deadline Rescue button */}
                {selectedTask.status === 'pending' && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Action button 1: Rescue */}
                    <button 
                      id={`rescue-btn-${selectedTask.id}`}
                      onClick={() => triggerDeadlineRescue(selectedTask.id)}
                      className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-xs hover:bg-red-500/15 transition flex items-center justify-center space-x-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{selectedTask.rescuePlan ? 'Recalculate Rescue Plan' : 'Generate Rescue Strategy'}</span>
                    </button>

                    {/* Action button 2: Breakdown */}
                    <button 
                      id={`breakdown-btn-${selectedTask.id}`}
                      onClick={() => triggerTaskBreakdown(selectedTask.id)}
                      className="w-full py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent font-semibold text-xs hover:bg-accent/15 transition flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Autonomous Task Breakdown</span>
                    </button>

                    {/* Action button 3: Procrastination */}
                    <button 
                      id={`procrastinate-btn-${selectedTask.id}`}
                      onClick={() => triggerProcrastinationAnalysis(selectedTask.id)}
                      className="w-full py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold text-xs hover:bg-violet-500/15 transition flex items-center justify-center space-x-1.5"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Procrastination Diagnostics</span>
                    </button>

                    {/* Action button 4: High-Stakes Focus Room */}
                    <button 
                      id={`sprint-focus-btn-${selectedTask.id}`}
                      onClick={() => {
                        setSprintTimeLeft(1500); // Reset to 25 mins
                        setIsSprintRunning(true);
                        setIsSprintModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-accent text-black font-bold text-xs shadow-lg shadow-accent/10 hover:opacity-95 transition flex items-center justify-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-black animate-bounce" />
                      <span>Activate Sprint Focus Room</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Display AI outputs (Rescue roadmap / subtasks) */}
              {selectedTask.rescuePlan && (
                <div className="space-y-3 bg-red-500/5 border border-red-500/15 p-4 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider font-mono">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Emergency Recovery Roadmap</span>
                  </div>
                  
                  <div className="space-y-3 text-[11px] leading-relaxed">
                    <div>
                      <span className="font-semibold text-white">Today:</span>
                      <ul className="list-disc pl-4 text-gray-300">
                        {selectedTask.rescuePlan.today.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Tomorrow:</span>
                      <ul className="list-disc pl-4 text-gray-300">
                        {selectedTask.rescuePlan.tomorrow.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Day After:</span>
                      <ul className="list-disc pl-4 text-gray-300">
                        {selectedTask.rescuePlan.dayAfter.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <p className="text-gray-400 italic pt-1 border-t border-red-500/10 leading-normal">
                      {selectedTask.rescuePlan.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Subtasks listing */}
              {selectedTask.subtasks.length > 0 && (
                <div className="space-y-2 bg-white/[0.02] border border-border-main p-4 rounded-xl">
                  <div className="text-xs font-semibold text-primary-text">Execution Checklist</div>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center space-x-2 text-xs">
                        <button 
                          id={`toggle-subtask-${st.id}`}
                          onClick={() => toggleSubtaskStatus(selectedTask.id, st.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${st.completed ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-600'}`}
                        >
                          {st.completed && <span className="text-[10px]">✓</span>}
                        </button>
                        <span className={`${st.completed ? 'text-secondary-text line-through' : 'text-primary-text'}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border-border-main text-center py-16 space-y-2">
              <HelpCircle className="w-8 h-8 text-secondary-text mx-auto" />
              <div className="text-secondary-text text-xs">Select a task from the list to view diagnostic tools and rescue plans.</div>
            </div>
          )}
        </div>

      </div>

      {/* Interactive Sprint Focus Companion Modal */}
      {isSprintModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-primary-bg border border-border-main rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Visual background glow elements */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-red-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-orange-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase">HIGH-STAKES FOCUS ROOM</span>
                </div>
                <h3 className="font-display font-bold text-primary-text text-lg sm:text-xl line-clamp-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsSprintRunning(false);
                  setIsSprintModalOpen(false);
                }}
                className="p-1.5 bg-white/5 border border-border-main text-secondary-text hover:text-primary-text rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Visual Countdown Circle */}
            <div className="flex flex-col items-center justify-center py-4 relative z-10">
              <div className="w-44 h-44 rounded-full border-4 border-red-500/20 flex flex-col items-center justify-center relative shadow-inner shadow-red-500/5 bg-secondary-bg">
                <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin duration-3000 opacity-60" style={{ animationDuration: '6s' }} />
                <span className="text-3xl font-mono font-bold text-primary-text tracking-widest">
                  {formatSprintTime(sprintTimeLeft)}
                </span>
                <span className="text-[9px] font-mono text-secondary-text uppercase tracking-widest mt-1">Remaining Block</span>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-3 mt-4 text-xs font-semibold">
                <button 
                  onClick={() => setIsSprintRunning(!isSprintRunning)}
                  className={`px-4.5 py-1.5 rounded-lg border transition ${
                    isSprintRunning 
                      ? 'bg-red-500/10 text-red-400 border-red-500/25' 
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                  }`}
                >
                  {isSprintRunning ? 'Pause Study' : 'Start Focus'}
                </button>
                <button 
                  onClick={() => setSprintTimeLeft(prev => prev + 300)}
                  className="px-4 py-1.5 bg-white/5 text-secondary-text border border-border-main hover:border-white/15 rounded-lg transition"
                >
                  +5 Mins Boost
                </button>
              </div>
            </div>

            {/* Study sound simulator & subtasks tracker */}
            <div className="space-y-4 relative z-10">
              {/* Binaural beats noise simulator */}
              <div className="p-3.5 bg-white/[0.02] border border-border-main rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg ${isSoundPlaying ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-slate-800/50 text-secondary-text'}`}>
                    {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-primary-text">Binaural Study Beats Generator</span>
                    <p className="text-[9px] text-secondary-text">{isSoundPlaying ? 'Playing deep study flow frequencies (40Hz)' : 'Muted - Click trigger'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSoundPlaying(!isSoundPlaying)}
                  className="px-3 py-1 bg-surface hover:bg-white/5 text-orange-400 border border-orange-500/20 text-[10px] font-bold rounded transition"
                >
                  {isSoundPlaying ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Subtask listing with checking */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-secondary-text">Current Study Milestones</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {selectedTask.subtasks.length > 0 ? (
                    selectedTask.subtasks.map(st => (
                      <div key={st.id} className="p-3 rounded-lg bg-black/40 border border-border-main flex items-center justify-between text-xs">
                        <span className={`${st.completed ? 'text-secondary-text line-through' : 'text-primary-text'}`}>{st.title}</span>
                        <button 
                          onClick={() => toggleSubtaskStatus(selectedTask.id, st.id)}
                          className={`px-2 py-0.5 rounded border text-[10px] transition ${st.completed ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-white/5 border-border-main text-secondary-text'}`}
                        >
                          {st.completed ? 'Finished' : 'Mark Complete'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center rounded-lg bg-black/20 border border-border-main text-[11px] text-secondary-text">
                      No milestones attached. Break down this task to unlock structural checklists!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Completion / Submit */}
            <div className="pt-2 relative z-10 flex gap-3">
              <button 
                onClick={() => {
                  setIsSprintRunning(false);
                  setIsSprintModalOpen(false);
                }}
                className="w-1/3 py-2.5 bg-surface border border-border-main hover:bg-white/5 text-secondary-text hover:text-primary-text rounded-xl text-xs font-semibold transition"
              >
                Quit Focus
              </button>
              <button 
                onClick={async () => {
                  await toggleTaskStatus(selectedTask.id);
                  setIsSprintRunning(false);
                  setIsSprintModalOpen(false);
                }}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                Complete & Claim Badges!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
