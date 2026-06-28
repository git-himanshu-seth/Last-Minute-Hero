import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Calendar } from './components/Calendar';
import { Goals } from './components/Goals';
import { Habits } from './components/Habits';
import { Reports } from './components/Reports';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Settings } from './components/Settings';
import { Diagnostics } from './components/Diagnostics';
import { Workspace } from './components/Workspace';
import { UpgradeModal } from './components/UpgradeModal';
import { SimulatedCheckout } from './components/SimulatedCheckout';
import { 
  Clock, 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Target, 
  Flame, 
  BrainCircuit, 
  Volume2, 
  Settings as SettingsIcon,
  Bell,
  LogOut,
  User as UserIcon,
  X,
  Check,
  Menu,
  ShieldCheck,
  Users
} from 'lucide-react';

interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ isOpen, onClose }) => {
  const { user, activeTab, setActiveTab, notifications, readNotification, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'AI Workspace', icon: Users },
    { id: 'tasks', label: 'AI Task Manager', icon: CheckSquare },
    { id: 'calendar', label: 'Mission Calendar', icon: CalendarDays },
    { id: 'goals', label: 'Milestones', icon: Target },
    { id: 'habits', label: 'Smart Habits', icon: Flame },
    { id: 'reports', label: 'Productivity Coach', icon: BrainCircuit },
    { id: 'voice', label: 'Voice Assistant', icon: Volume2 },
    { id: 'diagnostics', label: 'API Monitor & Tests', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 flex flex-col h-screen w-64 bg-[#080808] border-r border-white/5 text-slate-400 font-sans shrink-0 transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Sidebar Header Brand */}
      <div className="p-5.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center font-bold text-black shadow-md shadow-red-500/10 shrink-0">
            !
          </div>
          <span className="font-display font-semibold text-sm tracking-tight text-white leading-tight">
            Lifesaver AI<br/>
            <span className="text-slate-500 font-medium text-[10px]">Command Center</span>
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Close button for mobile/tablet */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/5 hover:bg-white/[0.04] text-slate-400 hover:text-white transition md:hidden"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Notifications Icon with indicator badge */}
          <div className="relative">
            <button 
              id="notif-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg border border-white/5 hover:bg-white/[0.04] text-slate-400 hover:text-white transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 pulse-red" />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 md:left-0 mt-2.5 w-72 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">System Alerts</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-2.5 rounded-lg text-[11px] leading-relaxed relative flex justify-between gap-2.5 ${
                          notif.read ? 'bg-white/[0.01] text-slate-500' : 'bg-orange-500/5 border border-orange-500/10 text-slate-200 font-medium'
                        }`}
                      >
                        <span>{notif.message}</span>
                        {!notif.read && (
                          <button 
                            id={`read-notif-${notif.id}`}
                            onClick={() => readNotification(notif.id)}
                            className="text-orange-400 hover:text-orange-300 shrink-0 self-start"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-500 text-center py-4">No new alerts or suggestions</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Menu List */}
      <nav className="flex-1 py-4.5 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setShowNotifications(false);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 font-semibold shadow-lg shadow-amber-500/5' 
                  : item.id === 'diagnostics' 
                    ? 'hover:bg-amber-500/5 hover:text-amber-300 text-amber-500/75 border border-dashed border-amber-500/20' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : item.id === 'diagnostics' ? 'text-amber-500/70' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.id === 'diagnostics' && (
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase shrink-0">
                  DEV
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Rescue Banner */}
      <div className="mx-3 mb-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest mb-1">Rescue Mode Active</p>
        <p className="text-[11px] text-orange-200/70 leading-normal">AI is actively safeguarding active milestones and deadlines.</p>
      </div>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between gap-3 text-xs bg-[#050505]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img 
            src={user?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"} 
            alt="User profile" 
            className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">{user?.name.split(' ')[0]}</div>
            <div className="text-[9px] font-mono text-slate-500 truncate uppercase tracking-wider">Score: {user?.productivityScore}</div>
          </div>
        </div>
        <button 
          id="sidebar-logout-btn"
          onClick={logout} 
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface MainWorkspaceProps {
  onOpenSidebar: () => void;
}

const MainWorkspace: React.FC<MainWorkspaceProps> = ({ onOpenSidebar }) => {
  const { activeTab, user, tasks } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'workspace': return <Workspace />;
      case 'tasks': return <Tasks />;
      case 'calendar': return <Calendar />;
      case 'goals': return <Goals />;
      case 'habits': return <Habits />;
      case 'reports': return <Reports />;
      case 'voice': return <VoiceAssistant />;
      case 'diagnostics': return <Diagnostics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  // Find next predicted risk dynamically
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const highRiskTask = pendingTasks.reduce((highest, current) => {
    if (!highest) return current;
    return (current.riskScore || 0) > (highest.riskScore || 0) ? current : highest;
  }, undefined as any);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#050505]/80 backdrop-blur shrink-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="mobile-menu-btn"
            onClick={onOpenSidebar}
            className="p-1.5 rounded-lg border border-white/5 hover:bg-white/[0.04] text-slate-400 hover:text-white md:hidden transition"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 uppercase font-bold tracking-tight">
            Live Analysis
          </span>
          <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
            Next predicted risk: {' '}
            {highRiskTask ? (
              <span className="text-white font-medium">
                {highRiskTask.title} ({new Date(highRiskTask.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
              </span>
            ) : (
              <span className="text-slate-500 font-medium">None! Fully on track</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-500">
              Productivity Rank: {user?.productivityScore && user.productivityScore >= 80 ? 'Top 10%' : 'Top 25%'}
            </p>
          </div>
          <img 
            src={user?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"} 
            alt="Profile Avatar" 
            className="w-8.5 h-8.5 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover"
          />
        </div>
      </header>

      {/* Workspace Inner Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-7 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, activeTab, startDemoMode, loginWithGoogle, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (window.location.pathname === '/simulated-checkout') {
    return <SimulatedCheckout />;
  }

  if (!user && activeTab === 'landing') {
    return (
      <LandingPage 
        onStartDemo={startDemoMode} 
        onLogin={loginWithGoogle} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}
      <SidebarNavigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MainWorkspace onOpenSidebar={() => setSidebarOpen(true)} />
      <UpgradeModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <ToastContainer />
    </AppProvider>
  );
}
