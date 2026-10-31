'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Repeat,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronRight,
  Zap,
  Building,
  Briefcase,
  UserCheck,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import SmartRevenueWaterfall from '@/components/SmartRevenueWaterfall';
import CustomerRiskRadar from '@/components/CustomerRiskRadar';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerStats, setSelectedCustomerStats] = useState<{
    subsCount: number;
    invCount: number;
    unpaidCount: number;
  }>({ subsCount: 0, invCount: 0, unpaidCount: 0 });
  const [activePortalFilter, setActivePortalFilter] = useState<'ALL' | 'ADMIN' | 'STAFF' | 'CUSTOMER'>('ALL');

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((res) => res.json()),
      fetch('/api/customers').then((res) => res.json()),
    ])
      .then(([dashData, custList]) => {
        setStats(dashData);
        if (Array.isArray(custList) && custList.length > 0) {
          setCustomers(custList);
          setSelectedCustomerId(custList[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch quick stats for selected customer
  useEffect(() => {
    if (!selectedCustomerId) return;
    Promise.all([
      fetch(`/api/subscriptions?customerId=${selectedCustomerId}`).then((r) => r.json()),
      fetch(`/api/invoices?customerId=${selectedCustomerId}`).then((r) => r.json()),
    ]).then(([subData, invData]) => {
      const subs = Array.isArray(subData) ? subData : [];
      const invs = Array.isArray(invData) ? invData : [];
      const unpaid = invs.filter((i: any) => i.status !== 'PAID');
      setSelectedCustomerStats({
        subsCount: subs.length,
        invCount: invs.length,
        unpaidCount: unpaid.length,
      });
    });
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleLaunchPortal = (role: 'ADMIN' | 'STAFF' | 'CUSTOMER', targetUrl?: string) => {
    localStorage.setItem('brightloop_role', role);
    if (role === 'CUSTOMER' && selectedCustomerId) {
      localStorage.setItem('brightloop_customer_id', selectedCustomerId);
      router.push(targetUrl || `/portal?customerId=${selectedCustomerId}`);
    } else if (role === 'STAFF') {
      router.push(targetUrl || '/subscriptions');
    } else {
      router.push(targetUrl || '/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading Brightloop Unified ERP Portals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. THREE ROLE PORTALS GATEWAY AT FIRST (Mandated in Specification)       */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Portal Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Enterprise Role Portal Gateway
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                RBAC Core
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select one of the <strong>three role-isolated portals</strong> below to access system controls, operational workflows, or customer self-service.
            </p>
          </div>

          {/* Quick Filter Pill */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
            {(['ALL', 'ADMIN', 'STAFF', 'CUSTOMER'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActivePortalFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activePortalFilter === filter
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {filter === 'ALL'
                  ? 'All 3 Portals'
                  : filter === 'ADMIN'
                  ? '👑 Admin'
                  : filter === 'STAFF'
                  ? '💼 Internal Staff'
                  : '👤 Customer ID'}
              </button>
            ))}
          </div>
        </div>

        {/* The 3 Dedicated Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 relative z-10">
          {/* ========================================= */}
          {/* PORTAL 1: ADMIN SECTION                  */}
          {/* ========================================= */}
          <div
            className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
              activePortalFilter === 'ALL' || activePortalFilter === 'ADMIN'
                ? 'bg-gradient-to-b from-purple-950/20 to-slate-900/60 border-purple-500/30 shadow-lg shadow-purple-950/30'
                : 'opacity-40 hover:opacity-80 bg-slate-900/30 border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Full Control
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>👑</span> 1. Admin Section
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Controls the entire system. Configures master products, plan cycles, tax rules, and discount limits. Only the admin can add new members of staff.
                </p>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between text-slate-400">
                  <span>System Scope:</span>
                  <span className="text-purple-300 font-medium">Unrestricted Master</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Product Variants:</span>
                  <span className="text-emerald-400 font-mono">+$560 Odoo Delta</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Discount Caps:</span>
                  <span className="text-slate-200">Admin-governed</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => handleLaunchPortal('ADMIN', '/')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
              >
                <span>Access Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <Link href="/products" className="hover:text-purple-300 transition">
                  • Products & Variants
                </Link>
                <Link href="/discounts" className="hover:text-purple-300 transition">
                  • Discount Engine
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* PORTAL 2: INTERNAL STAFF SECTION          */}
          {/* ========================================= */}
          <div
            className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
              activePortalFilter === 'ALL' || activePortalFilter === 'STAFF'
                ? 'bg-gradient-to-b from-indigo-950/20 to-slate-900/60 border-indigo-500/30 shadow-lg shadow-indigo-950/30'
                : 'opacity-40 hover:opacity-80 bg-slate-900/30 border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Day-to-Day Ops
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>💼</span> 2. Internal Staff Section
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Handles customers and billing day to day. Prepares quotations from templates, advances subscriptions, sends invoices, and records payments.
                </p>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pipeline Flow:</span>
                  <span className="text-indigo-300 font-medium">Draft ➔ Quote ➔ Active</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Quotes Pending:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {stats?.quotationsCount || 0} proposals
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Payment Methods:</span>
                  <span className="text-slate-200">UPI, Wire, Card</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => handleLaunchPortal('STAFF', '/subscriptions')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition"
              >
                <span>Access Staff Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <Link href="/subscriptions" className="hover:text-indigo-300 transition">
                  • Quote Pipeline
                </Link>
                <Link href="/invoices" className="hover:text-indigo-300 transition">
                  • Invoices & Payments
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* PORTAL 3: CUSTOMER PORTAL (WITH CUST ID)  */}
          {/* ========================================= */}
          <div
            className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
              activePortalFilter === 'ALL' || activePortalFilter === 'CUSTOMER'
                ? 'bg-gradient-to-b from-emerald-950/25 to-slate-900/60 border-emerald-500/40 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                : 'opacity-40 hover:opacity-80 bg-slate-900/30 border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Tenant Isolated
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>👤</span> 3. Customer Portal (ID Auth)
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Customers view and self-manage only their own subscriptions and invoices without having to email anyone.
                </p>
              </div>

              {/* Customer ID Selector Field */}
              <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <label className="block text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
                  <span>Select Customer ID:</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {selectedCustomer?.id?.slice(0, 10)}...
                  </span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      CUST-{String(idx + 1).padStart(3, '0')}: {c.companyName || c.name}
                    </option>
                  ))}
                </select>

                {/* Selected Customer ID Live Glance */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-800/60">
                  <span>
                    Active Plans: <strong className="text-emerald-400">{selectedCustomerStats.subsCount}</strong>
                  </span>
                  <span>
                    Unpaid Invoices:{' '}
                    <strong className={selectedCustomerStats.unpaidCount > 0 ? 'text-amber-400' : 'text-slate-400'}>
                      {selectedCustomerStats.unpaidCount}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() =>
                  handleLaunchPortal('CUSTOMER', `/portal?customerId=${selectedCustomerId}`)
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition"
              >
                <span>Enter Customer Portal (CUST-ID)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>• Pay via UPI / Card</span>
                <span>• Download GST PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE DASHBOARD & FINANCE OVERVIEW SECTION                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Finance & Operations Intelligence Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time recurring revenue metrics, active subscriptions, and cash flow status across Brightloop.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/subscriptions"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Repeat className="w-3.5 h-3.5" />
            Manage Subscriptions
          </Link>
          <Link
            href="/invoices"
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Billing Center
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats?.mrr?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% from last month</span>
          </div>
        </div>

        {/* ARR Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Run Rate (ARR)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats?.arr?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Based on current active contracts
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.activeSubscriptionsCount || 0}
          </div>
          <div className="text-xs text-indigo-300 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{stats?.quotationsCount || 0} quotes awaiting confirmation</span>
          </div>
        </div>

        {/* Overdue Invoices Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue / Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            ${stats?.overdueAmount?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-amber-400 mt-2">
            {stats?.overdueInvoicesCount || 0} invoice(s) past due date
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Recurring Revenue Trend (MRR)</h2>
            <p className="text-xs text-slate-400">Monthly breakdown and projected growth trajectory</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            Last 6 Months
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.monthlyTrend || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a855f7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Revenue Analytics: MRR Waterfall & Cashflow Projections */}
      <SmartRevenueWaterfall />

      {/* Customer Health & Churn Risk Radar */}
      <CustomerRiskRadar />

      {/* 2-Column Section: Recent Subscriptions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-400" />
              Active Subscriptions & Quotes
            </h3>
            <Link href="/subscriptions" className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {stats?.recentSubscriptions?.map((sub: any) => {
              const statusColors: any = {
                ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                QUOTATION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                CLOSED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              };
              return (
                <div key={sub.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {sub.customer?.companyName || sub.customer?.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-purple-300">{sub.subscriptionNumber}</span>
                      <span>•</span>
                      <span>{sub.plan?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${
                        statusColors[sub.status] || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Recent Invoices & Cash Flow
            </h3>
            <Link href="/invoices" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {stats?.recentInvoices?.map((inv: any) => {
              const invStatusColors: any = {
                PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                CONFIRMED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              };
              return (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200 font-mono">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inv.customer?.companyName || inv.customer?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-100 font-mono">
                      ${inv.totalAmount?.toLocaleString()}
                    </div>
                    <span
                      className={`text-[10px] font-medium border px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        invStatusColors[inv.status] || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
