import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, title, message, type } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-neutral-900/95 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      glow: 'shadow-emerald-500/5 ring-1 ring-emerald-500/20',
    },
    error: {
      bg: 'bg-neutral-900/95 border-rose-500/30 text-rose-400',
      icon: <XCircle className="h-5 w-5 text-rose-400" />,
      glow: 'shadow-rose-500/5 ring-1 ring-rose-500/20',
    },
    info: {
      bg: 'bg-neutral-900/95 border-sky-500/30 text-sky-400',
      icon: <Info className="h-5 w-5 text-sky-400" />,
      glow: 'shadow-sky-500/5 ring-1 ring-sky-500/20',
    },
    warning: {
      bg: 'bg-neutral-900/95 border-amber-500/30 text-amber-400',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      glow: 'shadow-amber-500/5 ring-1 ring-amber-500/20',
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-md shadow-lg ${config.bg} ${config.glow} text-left`}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-black text-white leading-normal tracking-wide uppercase font-sans">
          {title}
        </h5>
        <p className="text-[11px] text-zinc-300 font-medium leading-relaxed mt-1">
          {message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-zinc-500 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/5 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
