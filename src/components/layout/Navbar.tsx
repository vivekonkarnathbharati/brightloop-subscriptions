'use client';

import React from 'react';
import { useBrightloop } from '@/lib/store';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  Zap,
  LogOut,
  Shield,
  Briefcase,
  Building2,
} from 'lucide-react';

interface NavbarProps {
  onRunBilling?: () => void;
}

export function Navbar({ onRunBilling }: NavbarProps) {
  const { currentUser, runBillingDay, logout } = useBrightloop();

  const handleBillingRun = () => {
    runBillingDay();
    if (onRunBilling) onRunBilling();
  };

  const role = currentUser.role;

  // Role-Specific Theme Configurations
  // Customer: Soft Sunshine + Warm Orange
  // Admin: Black + Neon Lime + Electric Green
  // Sales Rep (Staff): Deep Blue + Coral + Vibrant Cyan
  const logoPalette = role === 'ADMIN' ? 'admin' : role === 'CUSTOMER' ? 'customer' : 'sales';

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950 text-lime-400 border border-lime-500/50 shadow-sm shadow-lime-500/15">
            <Shield className="w-3.5 h-3.5 text-lime-400" />
            <span>Admin Console</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-lime-500/20 text-lime-300 font-mono">Neon Lime</span>
          </span>
        );
      case 'STAFF':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-rose-400" />
            <span>Sales Rep Console</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">Cyan + Coral</span>
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-orange-800 border border-amber-300 shadow-sm shadow-orange-500/10">
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
            <span>Customer Portal</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 font-mono">Sunshine + Orange</span>
          </span>
        );
    }
  };

  const getBillingButtonClasses = () => {
    if (role === 'ADMIN') {
      return 'bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-500 hover:to-emerald-500 text-slate-950 shadow-md shadow-lime-500/25';
    }
    if (role === 'CUSTOMER') {
      return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/25';
    }
    // Sales Rep
    return 'bg-gradient-to-r from-blue-700 via-cyan-600 to-rose-500 hover:from-blue-800 hover:to-rose-600 text-white shadow-md shadow-cyan-500/25';
  };

  const getAvatarClasses = () => {
    if (role === 'ADMIN') {
      return 'bg-slate-950 text-lime-400 border border-lime-500/60 shadow-sm shadow-lime-500/20';
    }
    if (role === 'CUSTOMER') {
      return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-orange-500/20';
    }
    return 'bg-gradient-to-br from-blue-900 to-cyan-600 text-white border border-rose-400/40 shadow-sm';
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
        role === 'ADMIN'
          ? 'border-slate-800 bg-slate-950/95 text-white backdrop-blur supports-[backdrop-filter]:bg-slate-950/80'
          : 'border-slate-200 bg-white/95 text-slate-900 backdrop-blur supports-[backdrop-filter]:bg-white/80'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand & Tagline with Role-Adaptive Brightloop Logo */}
        <div className="flex items-center gap-4">
          <BrightloopLogo size={36} palette={logoPalette} showWordmark={true} />
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200/40">
            {role === 'ADMIN' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-lime-950 text-lime-400 border border-lime-500/40">
                Black + Neon Lime Engine
              </span>
            )}
            {role === 'CUSTOMER' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-orange-800 border border-amber-300">
                Soft Sunshine + Warm Orange Portal
              </span>
            )}
            {role === 'STAFF' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-950 text-cyan-300 border border-cyan-500/40">
                Deep Blue + Coral + Cyan Console
              </span>
            )}
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Brightloop v2.0
            </span>
          </div>
        </div>

        {/* Center: Current Persona Indicator */}
        <div className="hidden md:flex items-center gap-2">
          {getRoleBadge()}
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Billing Day Shortcut with Role-Themed Gradient */}
          <button
            onClick={handleBillingRun}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${getBillingButtonClasses()}`}
            title="Execute automated billing run"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Billing Run</span>
          </button>

          <div className={`h-5 w-px ${role === 'ADMIN' ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarClasses()}`}>
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className={`font-semibold ${role === 'ADMIN' ? 'text-slate-100' : 'text-slate-800'}`}>
                {currentUser.name}
              </div>
              <div className={`text-[10px] truncate max-w-[130px] ${role === 'ADMIN' ? 'text-slate-400' : 'text-slate-400'}`}>
                {currentUser.email}
              </div>
            </div>

            {/* Sign Out Trigger */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors font-semibold"
              title="Sign out and return to the login screen"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
