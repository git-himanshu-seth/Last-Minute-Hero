import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, Trash2, Check, Percent, Sparkles, Trophy } from 'lucide-react';
import { AiPolishButton } from './AiPolishButton';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, removeGoal } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'academic' | 'career' | 'financial' | 'fitness' | 'personal'>('career');
  const [targetDate, setTargetDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    addGoal(title, type, targetDate);
    setTitle('');
    setTargetDate('');
    setShowForm(false);
  };

  const getGoalColor = (gType: string) => {
    switch (gType) {
      case 'career': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'academic': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'financial': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'fitness': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-primary-text tracking-tight">Milestone Goals</h2>
          <p className="text-secondary-text text-xs sm:text-sm">Establish long-term goals. Your AI coach correlates daily tasks to these milestones.</p>
        </div>
        <button 
          id="toggle-goal-form"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:opacity-80 font-semibold text-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Define Goal</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5.5 rounded-2xl border-border-main grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs text-secondary-text font-medium">Goal Name</label>
            <div className="flex gap-2">
              <input 
                id="goal-title-input"
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Land a Google Summer of Code internship" 
                className="flex-1 bg-surface border border-border-main rounded-xl px-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-accent/50"
              />
              <AiPolishButton text={title} onPolish={setTitle} className="px-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-secondary-text font-medium">Type</label>
            <select 
              id="goal-type-select"
              value={type} 
              onChange={(e) => setType(e.target.value as any)} 
              className="w-full bg-surface border border-border-main rounded-xl px-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-accent/50"
            >
              <option value="career">Career Development</option>
              <option value="academic">Academic Excellence</option>
              <option value="financial">Financial Target</option>
              <option value="fitness">Health & Fitness</option>
              <option value="personal">Personal Development</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-secondary-text font-medium">Target Date</label>
            <input 
              id="goal-target-date"
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)} 
              className="w-full bg-surface border border-border-main rounded-xl px-4 py-2.5 text-xs text-primary-text focus:outline-none"
            />
          </div>

          <div className="flex items-end sm:col-span-1">
            <button 
              id="submit-goal-btn"
              type="submit" 
              className="w-full py-2.5 rounded-xl bg-accent text-black text-xs font-semibold hover:opacity-95 transition"
            >
              Add Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const isCompleted = goal.progress >= 100;
          return (
            <div 
              key={goal.id} 
              className="glass-panel p-5.5 rounded-2xl border-white/5 space-y-4 relative overflow-hidden group hover:border-white/10 transition"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getGoalColor(goal.type)}`}>
                    {goal.type}
                  </span>
                  <h4 className="font-display font-bold text-white text-sm sm:text-base leading-snug group-hover:text-orange-400 transition">
                    {goal.title}
                  </h4>
                </div>
                <button 
                  id={`remove-goal-btn-${goal.id}`}
                  onClick={() => removeGoal(goal.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Pacing Completion:</span>
                  <span className="font-mono text-white font-medium">{goal.progress}%</span>
                </div>
                
                <div className="relative w-full h-1.5 bg-gray-800 rounded-lg overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-gray-500">Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <div className="flex gap-2">
                    <button 
                      id={`bump-progress-${goal.id}`}
                      onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                      className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold"
                    >
                      +10% Progress
                    </button>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-0.5">
                        <Check className="w-3 h-3" />
                        <span>Achieved!</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
