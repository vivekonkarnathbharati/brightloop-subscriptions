'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Package,
  Percent,
  UserCheck,
  ShieldAlert,
  Zap,
  Building2,
  Bell,
} from 'lucide-react';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<'ADMIN' | 'STAFF' | 'CUSTOMER'>('ADMIN');
  const [isBillingRunLoading, setIsBillingRunLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync role to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('brightloop_role');
    if (saved) setRole(saved as any);
  }, []);

  const handleRoleChange = (newRole: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setRole(newRole);
    localStorage.setItem('brightloop_role', newRole);
    setNotification(`Switched active view to: ${newRole}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRunBillingDay = async () => {
    try {
      setIsBillingRunLoading(true);
      const res = await fetch('/api/billing-run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setNotification(`⚡ ${data.message}`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(data.error || 'Failed to run billing day');
      }
    } catch (e) {
      alert('Error triggering billing run');
    } finally {
      setIsBillingRunLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF'] },
    { name: 'Subscriptions', href: '/subscriptions', icon: Repeat, roles: ['ADMIN', 'STAFF'] },
    { name: 'Invoices & Billing', href: '/invoices', icon: Receipt, roles: ['ADMIN', 'STAFF'] },
    { name: 'Products & Plans', href: '/products', icon: Package, roles: ['ADMIN', 'STAFF'] },
    { name: 'Discounts', href: '/discounts', icon: Percent, roles: ['ADMIN'] },
    { name: 'Customer Portal', href: '/portal', icon: UserCheck, roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
            BL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Brightloop</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                Recurring ERP
              </span>
            </div>
            <p className="text-xs text-slate-400">Subscription & Automated Billing Engine</p>
          </div>
        </div>

        {/* Global Action & Role Switcher */}
        <div className="flex items-center gap-4">
          {notification && (
            <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <Zap className="w-3.5 h-3.5" />
              {notification}
            </div>
          )}

          {role === 'ADMIN' && (
            <button
              onClick={handleRunBillingDay}
              disabled={isBillingRunLoading}
              className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isBillingRunLoading ? 'animate-spin' : ''}`} />
              {isBillingRunLoading ? 'Running...' : '⚡ Run Billing Day'}
            </button>
          )}

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400 px-2 font-medium">View As:</span>
            <button
              onClick={() => handleRoleChange('ADMIN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleRoleChange('STAFF')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                role === 'STAFF' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              💼 Staff
            </button>
            <button
              onClick={() => handleRoleChange('CUSTOMER')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                role === 'CUSTOMER' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Customer Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
              Navigation
            </div>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User badge */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-xs text-purple-300">
              {role === 'ADMIN' ? 'AD' : role === 'STAFF' ? 'ST' : 'CU'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate text-slate-200">
                {role === 'ADMIN'
                  ? 'Brightloop HQ Admin'
                  : role === 'STAFF'
                  ? 'Sarah Jenkins (Sales)'
                  : 'Rajesh Sharma (Nexus)'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                Active Role: {role}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
