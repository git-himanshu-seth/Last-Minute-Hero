import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Sparkles, 
  Brain, 
  Clock, 
  Volume2, 
  Target, 
  CalendarDays, 
  ArrowRight,
  Upload,
  User,
  Lock,
  Mail,
  X,
  Camera
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onLogin: () => void;
  loading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onLogin, loading }) => {
  const { signUpWithCredentials, loginWithCredentials, sendPasswordReset, showToast } = useApp();
  
  // Custom credential auth states
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address first so we know where to send the reset link.', 'warning');
      setAuthError('Please enter your email address above to reset your password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (sendPasswordReset) {
        await sendPasswordReset(email);
        showToast('Password reset link has been dispatched to your email.', 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Please provide a valid email format (e.g., you@domain.com).';
      setAuthError(msg);
      showToast(msg, 'error');
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setAuthError(msg);
      showToast(msg, 'error');
      return;
    }

    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!email.trim() || !password.trim() || !username.trim()) {
          throw new Error('Please fill in all requested fields');
        }
        if (signUpWithCredentials) {
          await signUpWithCredentials(username, email, username, password, photoUrl || undefined);
        }
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email and password');
        }
        if (loginWithCredentials) {
          await loginWithCredentials(email, password);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
      showToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen bg-[#050505] text-gray-100 overflow-hidden font-sans">
      {/* Background ambient glowing circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-slate-900/15 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] rounded-full bg-red-900/5 blur-[100px] pointer-events-none" />

      {/* Navigation header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Clock className="w-5.5 h-5.5 text-white stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Last Minute Life Saver
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            id="demo-nav-btn"
            onClick={onStartDemo}
            className="text-xs px-4 py-2 rounded-lg text-gray-400 hover:text-white transition duration-200"
          >
            Try Demo Mode
          </button>
          <button 
            id="login-nav-btn"
            onClick={() => {
              setIsSignUp(false);
              setAuthError('');
              setShowAuthForm(true);
            }}
            disabled={loading}
            className="text-xs px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 font-medium text-white border border-gray-700/60 transition duration-200"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-20 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-red-500/20 text-xs text-red-400 mb-8 font-mono shadow-md shadow-red-950/10"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-red" />
          <span>Active Accountability Companion</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          AI that doesn't just remind you — <br />
          <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            it helps you finish.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-gray-400 text-sm sm:text-base mb-10 leading-relaxed font-sans"
        >
          Stop ignoring passive reminders. Last Minute Life Saver predicts deadline risk, isolates procrastination root causes, and automatically generates hour-by-hour Emergency Rescue Plans.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24"
        >
          <button 
            id="start-demo-hero-btn"
            onClick={onStartDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white font-medium shadow-xl shadow-red-500/20 hover:opacity-95 hover:shadow-red-500/30 transition duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <span>Activate Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            id="login-hero-btn"
            onClick={() => {
              setIsSignUp(false);
              setAuthError('');
              setShowAuthForm(true);
            }}
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-850 text-white font-medium transition duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <span>Sign In / Sign Up</span>
          </button>
        </motion.div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="glass-panel p-6.5 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20 text-red-400 group-hover:scale-110 transition duration-200">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display font-semibold text-white text-base mb-2">Deadline Rescue Mode</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              When remaining work exceeds remaining time, the AI flags a critical risk and reorganizes your schedules instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6.5 rounded-2xl relative overflow-hidden group hover:border-orange-500/30 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-5 border border-orange-500/20 text-orange-400 group-hover:scale-110 transition duration-200">
              <Brain className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display font-semibold text-white text-base mb-2">Procrastination Detector</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Find out exactly why you are delaying a task. Gemini analyzes cognitive resistance and suggests low-friction micro-actions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6.5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition duration-200">
              <Volume2 className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display font-semibold text-white text-base mb-2">Gemini Voice Assistant</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Talk directly to your AI coach. Ask "What should I do right now?" to receive vocal guidance and automated dashboard updates.
            </p>
          </div>
        </div>

        {/* Supporting Statistics Block */}
        <div className="mt-28 py-10 border-y border-gray-800/60 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <div className="font-display text-3xl font-bold text-white mb-1">98%</div>
            <div className="text-gray-500 text-xs">Submission Rate</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white mb-1">12,400+</div>
            <div className="text-gray-500 text-xs">Deadlines Rescued</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white mb-1">4.5h</div>
            <div className="text-gray-500 text-xs">Average Saved Weekly</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white mb-1">2.4x</div>
            <div className="text-gray-500 text-xs">Fewer Procrastinations</div>
          </div>
        </div>
      </main>

      {/* Credentials Authentication Overlay (Login / Signup + Image Upload) */}
      {showAuthForm && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-bl from-red-500/10 to-transparent pointer-events-none" />
            
            {/* Header & Toggle */}
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-lg">
                  {isSignUp ? 'Create Lifesaver Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-gray-400">
                  {isSignUp ? 'Sign up to rescue high-stakes missions' : 'Sign in to access your command center'}
                </p>
              </div>
              <button 
                onClick={() => setShowAuthForm(false)}
                className="p-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Switch tabs */}
            <div className="grid grid-cols-2 bg-black/40 p-1 rounded-xl border border-white/5 relative z-10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setAuthError('');
                }}
                className={`py-2 rounded-lg font-semibold transition ${!isSignUp ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setAuthError('');
                }}
                className={`py-2 rounded-lg font-semibold transition ${isSignUp ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 leading-normal">
                {authError}
              </div>
            )}

            {/* Custom Credentials Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-semibold uppercase text-slate-400">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. codeslinger"
                      required
                      className="w-full bg-[#070a12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold uppercase text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@lifesaver.ai"
                    required
                    className="w-full bg-[#070a12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-semibold uppercase text-slate-400">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-semibold text-orange-400 hover:text-orange-300 transition focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#070a12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Profile Image Upload */}
              {isSignUp && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block">Profile Avatar Image</span>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-4.5 h-4.5 text-slate-500" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Avatar
                    </button>
                  </div>
                </div>
              )}

              {/* Action submit button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-500/15 hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                {authLoading ? 'Signing process active...' : isSignUp ? 'Create Free Account' : 'Sign In Safely'}
              </button>
            </form>

            {/* Direct Google SSO Alternative */}
            <div className="relative z-10 pt-4 border-t border-white/5 space-y-3">
              <div className="relative flex justify-center text-[10px] uppercase font-mono text-slate-500">
                <span className="bg-[#0b0f19] px-2">Or Continue with Gmail</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAuthForm(false);
                  onLogin();
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-850 text-white font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.56 0-6.45-2.89-6.45-6.45s2.89-6.45 6.45-6.45c1.61 0 3.073.59 4.214 1.564l3.242-3.243C19.383 1.838 15.933 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.82 0 12.44-5.42 12.44-12.24 0-.79-.08-1.53-.24-2.235H12.24z"/>
                </svg>
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple footer */}
      <footer className="py-10 border-t border-gray-900/60 text-center relative z-10 text-gray-600 text-xs">
        &copy; 2026 Last Minute Life Saver. Built for Google AI Studio Hackathon. Powered by Google Gemini 2.5 Flash.
      </footer>
    </div>
  );
};
