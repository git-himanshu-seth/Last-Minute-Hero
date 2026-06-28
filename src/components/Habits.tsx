import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Check, Plus, Trash2, CalendarDays, BrainCircuit } from 'lucide-react';
import { AiPolishButton } from './AiPolishButton';

export const Habits: React.FC = () => {
  const { habits, addHabit, toggleHabitCompletion, removeHabit } = useApp();
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addHabit(title);
    setTitle('');
    setShowForm(false);
  };

  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">Smart Habits</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Build routines that protect your focus slots. Tracking daily habits reinforces productivity scores.</p>
        </div>
        <button 
          id="toggle-habit-form"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15 font-semibold text-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5.5 rounded-2xl border-white/5 flex gap-3 flex-col sm:flex-row max-w-xl items-center">
          <div className="flex-1 flex gap-2 w-full">
            <input 
              id="habit-title-input"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Code for 1 hour, read tech articles..." 
              className="flex-1 bg-[#0a0d16] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-orange-500/50"
            />
            <AiPolishButton text={title} onPolish={setTitle} className="px-3" />
          </div>
          <button 
            id="submit-habit-btn"
            type="submit" 
            className="py-2.5 px-5 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:opacity-95 transition whitespace-nowrap"
          >
            Track Habit
          </button>
        </form>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {habits.map((habit) => {
          const todayStr = getTodayStr();
          const isDoneToday = habit.completions.includes(todayStr);

          return (
            <div 
              key={habit.id} 
              className="glass-panel p-5.5 rounded-2xl border-white/5 space-y-4 relative overflow-hidden group hover:border-white/10 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center space-x-3.5">
                  <button 
                    id={`toggle-habit-${habit.id}`}
                    onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                      isDoneToday 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'border-white/10 text-gray-400 hover:border-orange-500/50'
                    }`}
                  >
                    <Check className={`w-5 h-5 ${isDoneToday ? 'stroke-[3]' : ''}`} />
                  </button>

                  <div className="space-y-0.5">
                    <h4 className="font-display font-semibold text-white text-sm sm:text-base leading-snug">
                      {habit.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                      <span>Consistency: {habit.consistencyScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 font-mono text-orange-400 font-bold text-sm">
                    <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500/10 animate-pulse" />
                    <span>{habit.streak}d</span>
                  </div>

                  <button 
                    id={`remove-habit-btn-${habit.id}`}
                    onClick={() => removeHabit(habit.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Habit Calendar Tracker Grid (Last 10 days representation) */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Consistency map (last 10 days)</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }).map((_, index) => {
                    const date = new Date(Date.now() - (9 - index) * 24 * 60 * 60 * 1000);
                    const formatted = date.toISOString().split('T')[0];
                    const completed = habit.completions.includes(formatted);
                    
                    return (
                      <div 
                        key={index} 
                        className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold font-mono transition-all border ${
                          completed 
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' 
                            : 'bg-white/[0.01] border-white/5 text-gray-600'
                        }`}
                        title={formatted}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Prediction block */}
              <div className="bg-orange-500/5 border border-orange-500/15 p-3 rounded-lg flex items-start gap-2 text-[10px] text-gray-300">
                <BrainCircuit className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  AI Prediction: Maintain current streak until Sunday to reach a consistency score of <span className="font-mono text-white font-semibold">96%</span> and unlock the "Deep Work Catalyst" achievement.
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
