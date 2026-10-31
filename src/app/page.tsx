'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading Brightloop Financial Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Finance & Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time recurring revenue metrics, active subscriptions, and cash flow status.
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
            Based on current active subscriptions
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
                      <span>{sub.subscriptionNumber}</span>
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
                    <div className="text-xs font-semibold text-slate-200">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inv.customer?.companyName || inv.customer?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-100">
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
