'use client';

import React from 'react';
import { useBrightloop } from '@/lib/store';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  CreditCard,
  Package,
  CalendarDays,
  Percent,
  SlidersHorizontal,
  Users,
  Building2,
  Lock,
  KeyRound,
  Zap,
  LogOut,
  Shield,
  Briefcase,
  PlusCircle,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'subscriptions'
  | 'invoices'
  | 'payments'
  | 'products'
  | 'plans'
  | 'discounts'
  | 'taxes'
  | 'staff'
  | 'portal'
  | 'new_subscription'
  | 'auth_validator';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { currentUser, isAdmin, isCustomer, logout, runBillingDay } = useBrightloop();

  // Navigation Items
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Finance Dashboard',
      icon: LayoutDashboard,
      badge: 'KPIs',
      hidden: isCustomer,
    },
    {
      id: 'subscriptions' as ActiveTab,
      label: 'Subscriptions & Quotes',
      icon: Repeat,
      hidden: isCustomer,
    },
    {
      id: 'invoices' as ActiveTab,
      label: 'Invoices & Billing',
      icon: Receipt,
      hidden: isCustomer,
    },
    {
      id: 'payments' as ActiveTab,
      label: 'Payment Records',
      icon: CreditCard,
      hidden: isCustomer,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Products & Variants',
      icon: Package,
      badge: '+560 Odoo',
      hidden: isCustomer,
    },
    {
      id: 'plans' as ActiveTab,
      label: 'Subscription Plans',
      icon: CalendarDays,
      hidden: isCustomer,
    },
    // Admin Restricted Sections
    {
      id: 'discounts' as ActiveTab,
      label: 'Discount Engine',
      icon: Percent,
      adminOnly: true,
      hidden: isCustomer,
    },
    {
      id: 'taxes' as ActiveTab,
      label: 'Tax Rules',
      icon: SlidersHorizontal,
      adminOnly: true,
      hidden: isCustomer,
    },
    {
      id: 'staff' as ActiveTab,
      label: 'Staff Directory',
      icon: Users,
      adminOnly: true,
      hidden: isCustomer,
    },
    // Customer Portal
    {
      id: 'portal' as ActiveTab,
      label: 'Customer Self-Portal',
      icon: Building2,
      badge: isCustomer ? 'Active Portal' : 'Preview',
    },
    {
      id: 'new_subscription' as ActiveTab,
      label: 'New Subscription',
      icon: PlusCircle,
      badge: 'Subscribe',
    },
    // Auth & Quality Validator (Admin only - hidden from Customer Portal)
    {
      id: 'auth_validator' as ActiveTab,
      label: 'Auth & Rule Validator',
      icon: KeyRound,
      badge: 'Edge-Cases',
      adminOnly: true,
      hidden: isCustomer,
    },
  ];

  return (
    <aside className="w-64 border-r border-[#EAE2D5] bg-[#FAF7F2] h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0 transition-colors duration-200 text-[#2C2621] overflow-hidden no-scrollbar select-none">
      <div className="space-y-4">
        {/* Brand Monogram & Header */}
        <div className="pb-3 border-b border-[#EAE2D5] px-1">
          <BrightloopLogo size={32} showWordmark={true} />
        </div>

        {/* Current Role Privileges Card */}
        <div className="p-3 rounded-xl border border-[#E5D7C5] bg-[#F5EDE1] text-xs text-[#3D3126]">
          <div className="flex items-center justify-between font-bold mb-1">
            <span className="flex items-center gap-1.5">
              {currentUser.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-[#B88457]" />}
              {currentUser.role === 'STAFF' && <Briefcase className="w-3.5 h-3.5 text-[#B88457]" />}
              {currentUser.role === 'CUSTOMER' && <Building2 className="w-3.5 h-3.5 text-[#B88457]" />}
              {currentUser.role}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#EAE0D1] text-[#635142]">
              Active
            </span>
          </div>
          <p className="text-[11px] leading-tight text-[#6D5E51]">
            {isAdmin && 'Full system control: Staff, Discounts, Taxes, and Pricing.'}
            {!isAdmin && !isCustomer && 'Sales rep: Manage quotes & subscriptions.'}
            {isCustomer && 'Scoped strictly to your company subscriptions and invoices.'}
          </p>
        </div>

        {/* Operations Navigation Section */}
        <nav className="space-y-1">
          <div className="text-[11px] font-bold tracking-wider uppercase text-[#8C7D70] px-3 mb-2">
            Operations
          </div>

          {navItems.map((item) => {
            if (item.hidden) return null;
            const isActive = activeTab === item.id;
            const isLocked = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-sm shadow-[#C29367]/25 font-bold'
                    : 'text-[#6A5E53] hover:text-[#2C2621] hover:bg-[#F0E6D8]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : isLocked ? 'text-[#A09285]' : 'text-[#827467]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isLocked && (
                    <span title="Admin Only" className="p-0.5 rounded text-[#8F5927] bg-[#F4ECE1]">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ECE2D5] text-[#5A4D42]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Quick Utilities */}
      <div className="pt-4 border-t border-[#EAE2D5] space-y-3">
        {/* Quick Billing Cycle Run */}
        <button
          onClick={() => runBillingDay()}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F3EBE0] hover:bg-[#EBE1D4] text-[#4A3C30] border border-[#DFD3C3] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Execute automated billing cycle run"
        >
          <Zap className="w-3.5 h-3.5 text-[#B88457] fill-current" />
          <span>Execute Billing Run</span>
        </button>

        {/* User Identity & Sign Out */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5EDE1] border border-[#E5D7C5]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C29367] to-[#B88457] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="text-left text-xs truncate leading-tight">
              <div className="font-bold text-[#2C2621] truncate">{currentUser.name}</div>
              <div className="text-[#7A6C60] text-[10px] truncate">{currentUser.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#8C3A32] hover:bg-[#F2DFDD] transition-colors shrink-0"
            title="Sign out and return to the login screen"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
