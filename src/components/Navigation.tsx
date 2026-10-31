'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  User,
} from 'lucide-react';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'ADMIN' | 'STAFF' | 'CUSTOMER'>('ADMIN');
  const [user, setUser] = useState<any>(null);
  const [isBillingRunLoading, setIsBillingRunLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync role and user from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('brightloop_role');
    const savedUser = localStorage.getItem('brightloop_user');

    if (savedRole) {
      setRole(savedRole as any);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('brightloop_user');
    localStorage.removeItem('brightloop_role');
    setUser(null);
    router.push('/login');
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

  // If on login page, render children cleanly without header and sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

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
          <Link href="/" className="flex items-center gap-3">
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
          </Link>
        </div>

        {/* Global Action & Profile Bar */}
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

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2.5 bg-slate-800/80 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                {role === 'ADMIN' ? 'AD' : role === 'STAFF' ? 'ST' : 'CU'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || (role === 'ADMIN' ? 'HQ Administrator' : role === 'STAFF' ? 'Sales Rep' : 'Customer')}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {role} {user?.companyName ? `• ${user.companyName}` : ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Sign Out</span>
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
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
                {role === 'ADMIN' ? 'AD' : role === 'STAFF' ? 'ST' : 'CU'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate text-slate-200">
                  {user?.name || (role === 'ADMIN' ? 'Brightloop HQ Admin' : role === 'STAFF' ? 'Sarah Jenkins' : 'Nexus Retail')}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {role} Access
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
