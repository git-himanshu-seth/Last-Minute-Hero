import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react';

export const Calendar: React.FC = () => {
  const { tasks, dailyPlan } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Map tasks to their deadline date (YYYY-MM-DD)
  const taskMap = tasks.reduce((acc: any, task) => {
    if (task.status === 'completed') return acc;
    const dateStr = new Date(task.deadline).toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const renderCells = () => {
    const cells = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-24 bg-white/[0.01] border border-white/5 opacity-40" />);
    }

    // Days cells
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = taskMap[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      cells.push(
        <div 
          key={day} 
          className={`min-h-24 p-2 border border-white/5 flex flex-col justify-between transition ${
            isToday ? 'bg-orange-500/5 border-orange-500/30' : 'bg-[#0a0d16]/30 hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-orange-400' : 'text-gray-400'}`}>
              {day}
            </span>
            {isToday && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </div>

          <div className="mt-1.5 space-y-1 overflow-y-auto max-h-16">
            {dayTasks.map((task: any) => (
              <div 
                key={task.id} 
                className={`text-[9px] px-1.5 py-0.5 rounded border truncate ${
                  task.riskLevel === 'critical' || task.riskLevel === 'high'
                    ? 'bg-red-500/10 border-red-500/25 text-red-300'
                    : 'bg-blue-500/10 border-blue-500/25 text-blue-300'
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Mission Schedule</h2>
        <p className="text-gray-400 text-xs sm:text-sm">Visualize active deadlines, schedule risks, and dynamic pacing across the month.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (Col span 2) */}
        <div className="lg:col-span-2 glass-panel p-5.5 rounded-2xl border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4.5 h-4.5 text-orange-400" />
              <h3 className="font-display font-bold text-white text-base">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                id="prev-month-btn"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/[0.04] text-gray-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                id="next-month-btn"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/[0.04] text-gray-400 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold border-b border-white/5 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCells()}
          </div>
        </div>

        {/* Legend & Daily Overview Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Schedule Legend</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded bg-red-500/15 border border-red-500/30" />
                <span className="text-gray-300">Critical / High Deadline Risk</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded bg-blue-500/15 border border-blue-500/30" />
                <span className="text-gray-300">Standard Pending Task</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded bg-orange-500/10 border border-orange-500/30" />
                <span className="text-gray-300">Current Today's Date</span>
              </div>
            </div>
          </div>

          {/* Daily Schedule helper */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Today's Focus Target</span>
            </div>
            
            {dailyPlan ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white">Focus Time: {dailyPlan.focusHours} Hours</div>
                <div className="space-y-2">
                  {dailyPlan.tasks.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px]">
                      <span className="font-mono text-orange-400 font-semibold">{slot.time}</span>
                      <span className="text-gray-300 line-clamp-1">{slot.taskTitle}</span>
                    </div>
                  ))}
                  {dailyPlan.tasks.length > 3 && (
                    <div className="text-[10px] text-gray-500 italic">+ {dailyPlan.tasks.length - 3} more schedule blocks</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-xs leading-relaxed">
                Generate today's mission schedule in the Dashboard tab to see your active focus plan list.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
