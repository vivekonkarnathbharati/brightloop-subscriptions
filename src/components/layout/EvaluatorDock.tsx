'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  ShieldAlert,
  Briefcase,
  Building2,
  Zap,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface EvaluatorDockProps {
  onRunBilling: () => void;
}

export function EvaluatorDock({ onRunBilling }: EvaluatorDockProps) {
  const { switchRole, resetDemoData, isAdmin, isStaff, isCustomer, logout } = useBrightloop();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside aria-label="Brightloop Demo Switcher" className="w-full bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-1.5 px-4 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Role Switcher Info with Mini Monogram */}
        <div className="flex items-center gap-2.5">
          <BrightloopLogo size={20} palette="fintech" showWordmark={false} />
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Demo Role Switcher
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Role Theme Switcher:
          </span>
        </div>

        {/* Center: Role Switcher Buttons */}
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            {/* Admin: Black + Neon Lime + Electric Green */}
            <button
              onClick={() => switchRole('ADMIN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                isAdmin
                  ? 'bg-lime-400 text-slate-950 font-bold shadow-sm shadow-lime-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Switch to Admin (Black + Neon Lime + Electric Green)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin (Neon Lime)</span>
            </button>

            {/* Sales Rep: Deep Blue + Coral + Vibrant Cyan */}
            <button
              onClick={() => switchRole('STAFF')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                isStaff
                  ? 'bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Switch to Sales Staff (Deep Blue + Coral + Cyan)"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sales Rep (Cyan)</span>
            </button>

            {/* Customer: Soft Sunshine + Warm Orange */}
            <button
              onClick={() => switchRole('CUSTOMER')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                isCustomer
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Switch to Customer Portal (Soft Sunshine + Warm Orange)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Customer (Sunshine)</span>
            </button>
          </div>
        )}

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              {/* Sign Out to Login Page */}
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-300 rounded text-xs border border-slate-700 font-medium transition-colors"
                title="Sign out and return to the primary sign-in page"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Sign Out</span>
              </button>

              {/* Billing Run */}
              <button
                onClick={onRunBilling}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                title="Trigger automated billing batch run"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span className="hidden md:inline">Billing Run</span>
              </button>

              {/* Reset Data */}
              <button
                onClick={resetDemoData}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Reset demo data to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Toggle Dock Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isCollapsed ? 'Expand Evaluator Dock' : 'Collapse Evaluator Dock'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
