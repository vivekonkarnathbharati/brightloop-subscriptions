'use client';

import React from 'react';
import { useBrightloop } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { notifications, dismissNotification } = useBrightloop();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border transition-all duration-200 animate-in slide-in-from-bottom-3 ${
            n.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-100 backdrop-blur-md'
              : n.type === 'error'
              ? 'bg-rose-950/90 border-rose-700/50 text-rose-100 backdrop-blur-md'
              : 'bg-slate-900/90 border-slate-700/50 text-slate-100 backdrop-blur-md'
          }`}
        >
          {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {n.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

          <p className="text-sm font-medium leading-snug flex-1">{n.message}</p>

          <button
            onClick={() => dismissNotification(n.id)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
