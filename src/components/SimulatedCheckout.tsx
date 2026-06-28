import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const SimulatedCheckout: React.FC = () => {
  const { upgradeUserPlan } = useApp();
  
  // Parse Query Parameters
  const [params, setParams] = useState({
    plan: 'pro',
    userId: 'demo-user',
    successUrl: '',
    cancelUrl: ''
  });

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvc, setCvc] = useState('321');
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'pro';
    const userId = urlParams.get('userId') || 'demo-user';
    const successUrl = urlParams.get('successUrl') || window.location.origin;
    const cancelUrl = urlParams.get('cancelUrl') || window.location.origin;

    setParams({ plan, userId, successUrl, cancelUrl });
  }, []);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      setTimeout(async () => {
        // Upgrade client-side and cloud storage if any
        await upgradeUserPlan(params.plan as any);
        // Redirect back to main page
        window.location.href = `${params.successUrl}?stripe_success=true&plan=${params.plan}`;
      }, 1500);

    }, 2000);
  };

  const planName = params.plan === 'pro' ? 'Pro Coach' : 'Enterprise Elite';
  const planPrice = params.plan === 'pro' ? '$12.00' : '$49.00';

  if (success) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#08080c] border border-emerald-500/30 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-white">Payment Authorized</h2>
            <p className="text-xs text-slate-400">Your subscription has been verified successfully via Stripe.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-300">
            Upgraded to <strong className="text-white font-bold">{planName}</strong> plan! Redirecting you to command center...
          </div>
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center px-4 sm:px-8 bg-[#050505]/80 backdrop-blur shrink-0 z-20">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <button 
            onClick={() => window.location.href = params.cancelUrl || '/'}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center font-bold text-black text-xs shrink-0">
              !
            </div>
            <span className="font-display font-semibold text-xs tracking-tight text-white">
              Lifesaver AI checkout
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: Order Summary */}
          <div className="p-8 rounded-2xl bg-[#08080c] border border-white/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Developer Sandbox Mode
                </span>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">Order Summary</h2>
                <p className="text-xs text-slate-400">You are completing checkout for your Lifesaver AI premium subscription.</p>
              </div>

              {/* Plan Box */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{planName}</p>
                  <p className="text-[10px] text-slate-500">Billed monthly • Cancel anytime</p>
                </div>
                <p className="text-sm font-bold text-orange-400">{planPrice}</p>
              </div>

              {/* Included Highlights */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Plan Highlights:</p>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Unlimited tasks and habit tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Grammar correcting AI suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Active Deadline Rescue and Coach advice
                  </li>
                </ul>
              </div>
            </div>

            {/* Simulated Stripe Alert */}
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[11px] text-orange-400 leading-normal flex gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Simulated Sandbox Environment</strong>
                Stripe API key is not currently configured in secrets. We are running in sandbox simulation mode so you can test subscriptions instantly!
              </div>
            </div>
          </div>

          {/* Column 2: Payment Form */}
          <div className="p-8 rounded-2xl bg-[#08080c] border border-white/10 flex flex-col justify-between space-y-6 shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs font-bold text-white">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <span>Card Details</span>
                </div>
                <div className="flex space-x-1.5">
                  <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400">Visa</span>
                  <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400">MC</span>
                  <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400">Amex</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Cardholder Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Jane Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40"
                    />
                    <CreditCard className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Expiration Date</label>
                    <input 
                      type="text" 
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">CVC</label>
                    <input 
                      type="password" 
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Contacting Stripe Gateway...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Subscribe for {planPrice}/mo
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500 flex justify-between items-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Stripe Verified checkout
              </span>
              <span>SSL Secure Connection</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-white/5 flex items-center justify-center text-[10px] text-slate-600 bg-[#040406]">
        © 2026 Lifesaver AI. Stripe Sandbox Simulation Mode.
      </footer>
    </div>
  );
};
