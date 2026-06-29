import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Lock, 
  ArrowRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const { 
    user, 
    tasks, 
    aiUsageCount, 
    showUpgradeModal, 
    setShowUpgradeModal, 
    upgradeUserPlan 
  } = useApp();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!showUpgradeModal) return null;

  const currentPlan = user?.plan || 'free';
  const totalTasksCount = tasks.length;

  const handleUpgrade = async (planKey: 'free' | 'pro' | 'enterprise') => {
    if (planKey === 'free') {
      upgradeUserPlan('free');
      return;
    }

    setLoadingPlan(planKey);
    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          userId: user?.id || 'demo-user',
          successUrl: window.location.origin,
          cancelUrl: window.location.origin,
        })
      });

      if (!response.ok) throw new Error('Checkout session creation failed');
      const data = await response.json();
      
      // Redirect to Checkout (Real Stripe or Simulation)
      if (data.url) {
        window.location.href = data.url;
      } else {
        upgradeUserPlan(planKey);
      }
    } catch (err) {
      console.error(err);
      // Fallback to direct mock upgrade on error
      upgradeUserPlan(planKey);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Free Tier',
      tagline: 'Basic task mapping',
      price: '0',
      description: 'Ideal for testing out Success Scheduler and basic lists.',
      features: [
        'Strict limit of 5 Tasks maximum',
        'Limit of 3 AI Assistant suggestions',
        'Basic priority categorization',
        'Demo Offline synchronizer',
      ],
      notIncluded: [
        'Unlimited AI Grammar Polish',
        'Active Deadline Rescue Plans',
        'Interactive Voice Assistant',
        'Multi-member AI Workspace templates',
        'Cloud SQL / Mongo Syncing',
      ],
      buttonText: 'Current Plan',
      accentColor: 'border-white/10 text-slate-400 bg-white/5',
      badge: null,
    },
    {
      key: 'pro',
      name: 'Pro Coach',
      tagline: 'The ultimate AI assistant',
      price: '12',
      description: 'Unlock complete automation, deadline rescue, and infinite productivity.',
      features: [
        'UNLIMITED Task capturing',
        'UNLIMITED AI Grammar correction & polish',
        'Active Deadline Rescue Plans & Alarms',
        'AI Procrastination & Time Machine insights',
        'Full Personal Productivity Coach & voice',
        'Real-time Cloud SQL / Mongo database syncs',
      ],
      notIncluded: [
        'Team template workspace models',
        'Live voice room meeting summaries',
      ],
      buttonText: 'Upgrade to Pro',
      accentColor: 'border-orange-500/30 ring-1 ring-orange-500/20 text-white bg-[#0e0905] shadow-lg shadow-orange-500/5',
      badge: 'Highly Popular',
    },
    {
      key: 'enterprise',
      name: 'Enterprise Elite',
      tagline: 'High-performance teams',
      price: '49',
      description: 'Designed for engineering squads, builders, and deep-focus sprints.',
      features: [
        'Everything in Pro Coach plan',
        'Team Workspace collaborative templates',
        'Live Voice meeting automatic summaries',
        'AI Standup Scrum robot assessment',
        'Custom Team productivity benchmarks',
        '24/7 Priority support hotline & diagnostics',
      ],
      notIncluded: [],
      buttonText: 'Get Enterprise Elite',
      accentColor: 'border-amber-500/30 ring-1 ring-amber-500/20 text-white bg-[#090905] shadow-lg shadow-amber-500/5',
      badge: 'Best Value',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#08080c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Banner Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-widest font-mono">
                Premium Plan Center
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Active Account Status
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Synchronize Success Scheduler Subscription
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              You are currently on the <span className="text-orange-400 font-semibold">{currentPlan.toUpperCase()} Plan</span>.
              Task limit: <span className="text-white font-mono">{totalTasksCount}/5</span> used.
              AI quota: <span className="text-white font-mono">{aiUsageCount}/3</span> utilized.
            </p>
          </div>
          <button 
            onClick={() => setShowUpgradeModal(false)}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Plans Bento Grid */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {plans.map((p) => {
            const isCurrent = currentPlan === p.key;
            const isProOrEnt = p.key !== 'free';
            return (
              <div 
                key={p.key}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition relative ${p.accentColor} ${
                  isCurrent ? 'ring-2 ring-orange-500 border-orange-500' : 'hover:border-white/15'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-4 bg-orange-500 text-black text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">{p.tagline}</p>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                  </div>

                  {/* Pricing Display */}
                  <div className="flex items-baseline space-x-1 border-y border-white/5 py-3">
                    <span className="text-3xl font-display font-bold text-white">${p.price}</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-1">
                    <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">Features Included:</p>
                    <ul className="space-y-2">
                      {p.features.map((f, idx) => (
                        <li key={idx} className="flex items-start text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 mr-2 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {p.notIncluded.map((f, idx) => (
                        <li key={idx} className="flex items-start text-[11px] text-slate-600">
                          <Lock className="w-3.5 h-3.5 text-slate-700 shrink-0 mr-2 mt-0.5" />
                          <span className="line-through">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="pt-6">
                  <button
                    disabled={isCurrent || loadingPlan !== null}
                    onClick={() => handleUpgrade(p.key as any)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      isCurrent 
                        ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 cursor-default'
                        : p.key === 'free'
                          ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                          : p.key === 'pro'
                            ? 'bg-orange-500 hover:bg-orange-600 text-black font-bold shadow-lg shadow-orange-500/10'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-black font-bold shadow-lg shadow-amber-500/10'
                    }`}
                  >
                    {loadingPlan === p.key ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Generating Checkout...
                      </span>
                    ) : (
                      <>
                        <span>{p.buttonText}</span>
                        {!isCurrent && isProOrEnt && <ArrowRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-5.5 bg-black/40 border-t border-white/5 text-[10px] text-slate-500 text-center relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Secure Encrypted Checkout powered by Stripe
          </span>
          <span>
            Refund policy: Cancel anytime, immediate subscription updates.
          </span>
        </div>

      </div>
    </div>
  );
};
