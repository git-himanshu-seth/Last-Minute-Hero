import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp, ToastMessage } from '../context/AppContext';

export const Toast: React.FC<ToastMessage> = ({ id, message, type }) => {
  const { dismissToast } = useApp();

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const bgBorderMap = {
    success: 'bg-[#0a1410] border-emerald-500/20 shadow-emerald-950/10 text-emerald-200',
    error: 'bg-[#150a0a] border-rose-500/20 shadow-rose-950/10 text-rose-200',
    warning: 'bg-[#14100a] border-amber-500/20 shadow-amber-950/10 text-amber-200',
    info: 'bg-[#0a1015] border-sky-500/20 shadow-sky-950/10 text-sky-200',
  };

  return (
    <motion.div
      id={`toast-item-${id}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95, transition: { duration: 0.2 } }}
      layout
      className={`flex items-center gap-3.5 px-4.5 py-4.5 rounded-2xl border ${bgBorderMap[type]} shadow-2xl backdrop-blur-md max-w-sm w-full select-none relative pointer-events-auto`}
    >
      <div className="flex-1 flex items-start gap-3">
        {iconMap[type]}
        <p className="text-xs font-medium leading-relaxed font-sans">{message}</p>
      </div>
      <button
        onClick={() => dismissToast(id)}
        className="p-1 text-gray-500 hover:text-white rounded-lg transition duration-150 shrink-0"
        title="Dismiss Alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  return (
    <div id="toast-container" className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="pop-layout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
