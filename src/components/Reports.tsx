import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, Trophy, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

export const Reports: React.FC = () => {
  const { report, generateProductivityReport } = useApp();
  const [loading, setLoading] = useState(false);

  const handleCompile = async () => {
    setLoading(true);
    try {
      await generateProductivityReport();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-primary-text tracking-tight">AI Productivity Coach</h2>
          <p className="text-secondary-text text-xs sm:text-sm">Continuous analysis of your scheduling execution, habits compliance, and deadline recovery speeds.</p>
        </div>
        <button 
          id="compile-report-btn"
          onClick={handleCompile}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:opacity-95 transition disabled:opacity-50 flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? "Analyzing behavior..." : "Compile Report"}</span>
        </button>
      </div>

      {report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block (Performance Score) */}
          <div className="glass-panel p-6 rounded-2xl border-border-main space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs text-secondary-text font-mono font-bold uppercase tracking-wider">Productivity Index</span>
              <h3 className="font-display font-bold text-primary-text text-base">Weekly Rating</h3>
            </div>

            <div className="py-6 flex flex-col items-center justify-center space-y-3 relative">
              {/* Custom Circular Progress representation using simple CSS/SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="64" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="var(--accent)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * report.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="font-display text-4xl font-bold text-primary-text tracking-tighter">{report.score}%</span>
                  <div className="text-[9px] text-secondary-text font-mono font-bold uppercase tracking-wider mt-0.5">Focus Grade</div>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed text-center font-sans">
              Calculated using completion pacing, rescue roadmap compliances, and habit routine streak values.
            </p>
          </div>

          {/* Right Blocks (Strengths & Weaknesses) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Strengths Card */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3.5">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Trophy className="w-4.5 h-4.5" />
                <h3 className="font-display font-bold text-white text-base">Isolated Strengths</h3>
              </div>
              <ul className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="text-gray-300 leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3.5">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-4.5 h-4.5" />
                <h3 className="font-display font-bold text-white text-base">Friction Points Identified</h3>
              </div>
              <ul className="space-y-3">
                {report.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="text-gray-300 leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions Card */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3.5">
              <div className="flex items-center space-x-2 text-amber-400">
                <Lightbulb className="w-4.5 h-4.5" />
                <h3 className="font-display font-bold text-white text-base">Coach Suggestions</h3>
              </div>
              <ul className="space-y-3">
                {report.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-gray-300 leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border-white/5 text-center py-24 space-y-4 max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-orange-400 animate-pulse mx-auto" />
          <h3 className="font-display font-bold text-white text-lg">No Coach Analysis Available</h3>
          <p className="text-gray-400 text-xs leading-relaxed max-w-md mx-auto">
            Your performance diagnostics have not been compiled yet. Click the "Compile Report" button above to let Gemini compute detailed insights into your task pacing, strengths, and cognitive roadblocks.
          </p>
          <button 
            id="compile-report-empty-btn"
            onClick={handleCompile}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs hover:opacity-95 transition flex items-center space-x-1.5 mx-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
};
