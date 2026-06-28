import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Mic, Send, Sparkles, BrainCircuit, Play, CornerDownLeft } from 'lucide-react';

export const VoiceAssistant: React.FC = () => {
  const { tasks, dailyPlan } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [actions, setActions] = useState<string[]>([]);
  
  // Audio state
  const [speaking, setSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse('');
    setActions([]);
    setSpeaking(false);
    
    // Stop any current speaking
    window.speechSynthesis?.cancel();

    try {
      const res = await fetch('/api/gemini/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: queryText,
          tasks,
          currentPlan: dailyPlan
        })
      });

      if (res.ok) {
        const data = await res.ok ? await res.json() : {};
        const spokenResponse = data.spokenResponse || "I looked at your schedules. Focus on your top-priority tasks right now.";
        setResponse(spokenResponse);
        setActions(data.actionsSuggested || []);

        // Trigger Speech Synthesis if not muted
        if (!voiceMuted && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(spokenResponse);
          utterance.onstart = () => setSpeaking(true);
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          
          // Try to select a nice English voice if available
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error(err);
      setResponse("I ran into an issue connecting to my vocal core. Let me know if I can help you with anything else.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(query);
    setQuery('');
  };

  // Stop speaking when switching away or unmounting
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const samplePrompts = [
    "What should I do now?",
    "Reschedule my tasks",
    "Show critical deadlines",
    "Plan my interview preparation"
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-primary-text tracking-tight">AI Voice Assistant</h2>
        <p className="text-secondary-text text-xs sm:text-sm">Speak or chat with Gemini Live-style audio coach. Receives natural commands and coordinates schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assistant Main Panel (Col span 2) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border-border-main space-y-6 flex flex-col justify-between min-h-[400px]">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Gemini Audio Core</span>
            </div>
            
            <button 
              id="mute-voice-btn"
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (speaking) window.speechSynthesis?.cancel();
              }}
              className="p-2 rounded-lg border border-white/5 hover:bg-white/[0.04] text-gray-400 hover:text-white transition"
              title={voiceMuted ? "Unmute vocal responses" : "Mute vocal responses"}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Interactive Core Display */}
          <div className="py-8 flex flex-col items-center justify-center space-y-6 flex-grow">
            {speaking ? (
              /* High quality visual frequency wave */
              <div className="flex items-center justify-center space-x-1 h-14">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full animate-bounce"
                    style={{ 
                      height: `${[40, 75, 100, 60, 90, 110, 80, 50, 30][i]}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            ) : loading ? (
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              /* Static pulse representing listening/idle state */
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center animate-pulse">
                <Mic className="w-6 h-6 text-orange-400" />
              </div>
            )}

            {/* Response area */}
            <div className="text-center space-y-2 max-w-md px-4">
              {response ? (
                <p className="text-primary-text text-sm leading-relaxed font-medium">
                  "{response}"
                </p>
              ) : (
                <p className="text-gray-400 text-xs font-sans">
                  Choose a prompt below or type a command to communicate with the vocal productivity companion.
                </p>
              )}
            </div>

            {/* Suggested UI Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {actions.map((act, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-1 rounded bg-white/[0.04] border border-white/5 text-orange-400 font-bold uppercase">
                    🛠️ {act}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Input Chat Box */}
          <form onSubmit={handleSubmit} className="relative mt-4">
            <input 
              id="voice-assistant-input"
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the AI coach anything..."
              className="w-full bg-surface border border-border-main rounded-xl pl-4 pr-12 py-3.5 text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent/50"
            />
            <button 
              id="voice-assistant-submit"
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-orange-500 text-white hover:opacity-90 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Right Block: Sample prompts/Chips */}
        <div className="space-y-6">
          <div className="glass-panel p-5.5 rounded-2xl border-white/5 space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Suggested Prompts</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  id={`suggested-prompt-${idx}`}
                  onClick={() => handleQuery(p)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-300 hover:border-orange-500/30 hover:bg-white/[0.03] transition flex items-center justify-between"
                >
                  <span>{p}</span>
                  <Play className="w-3 h-3 text-orange-400 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5.5 rounded-2xl border-white/5 space-y-3 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-center space-x-1.5 text-[10px] text-violet-400 font-mono font-bold uppercase tracking-wider">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Contextual Memory</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-sans">
              The AI assistant retains context of your active habits, completion consistency patterns, and overdue deadline risks to personalize vocal schedules.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
