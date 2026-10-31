'use client';

import React, { useState, useMemo } from 'react';
import { useBrightloop } from '@/lib/store';
import { calculateMRR, formatCurrency, formatDate, isInvoiceOverdue } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { ActiveTab } from '@/components/layout/Sidebar';
import {
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Zap,
} from 'lucide-react';

export function DashboardView({ onNavigate }: { onNavigate: (tab: ActiveTab) => void }) {
  const { subscriptions, invoices, payments, runBillingDay } = useBrightloop();
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30'>('ALL');

  // 1. Core KPIs
  const mrr = useMemo(() => calculateMRR(subscriptions), [subscriptions]);

  const activeSubsCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'ACTIVE' && !s.isPaused).length,
    [subscriptions]
  );

  const totalPaymentsCollected = useMemo(
    () => payments.reduce((acc, curr) => acc + curr.amount, 0),
    [payments]
  );

  const overdueInvoices = useMemo(
    () => invoices.filter((inv) => isInvoiceOverdue(inv)),
    [invoices]
  );

  const totalOverdueAmount = useMemo(
    () => overdueInvoices.reduce((acc, curr) => acc + curr.amountDue, 0),
    [overdueInvoices]
  );

  // Frequency distribution
  const frequencyStats = useMemo(() => {
    const counts = { DAILY: 0, WEEKLY: 0, MONTHLY: 0, YEARLY: 0 };
    subscriptions.forEach((s) => {
      if (counts[s.billingFrequency] !== undefined) {
        counts[s.billingFrequency]++;
      }
    });
    return counts;
  }, [subscriptions]);

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={34} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Finance Lead Executive Dashboard
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Executive Suite
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Real-time recurring revenue, payment collections, and cash flow risk monitor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F2ECE4] p-0.5 rounded-xl border border-[#E5DDD0] text-xs">
            <button
              onClick={() => setFilterPeriod('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterPeriod === 'ALL' ? 'bg-white text-[#2C2621] shadow-sm font-semibold' : 'text-[#6A5E53]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterPeriod('THIS_MONTH')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterPeriod === 'THIS_MONTH' ? 'bg-white text-[#2C2621] shadow-sm font-semibold' : 'text-[#6A5E53]'
              }`}
            >
              October 2026
            </button>
          </div>

          <button
            onClick={() => runBillingDay()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/25 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Billing Cycle</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: MRR */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-[#7A6D61] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="p-2 rounded-xl bg-[#F5EDE1] text-[#8F5927] border border-[#E8DACB]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2C2621]">{formatCurrency(mrr)}</div>
          <div className="flex items-center gap-1.5 text-xs text-[#8F5927] font-medium mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Normalized across Daily, Weekly, Yearly</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#F5EDE1]/60 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 2: Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeSubsCount}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{subscriptions.length} total contracts on book</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 3: Total Payments Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payments Collected</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPaymentsCollected)}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Across {payments.length} verified transactions</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 4: Overdue Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Invoices</span>
            <div className={`p-2 rounded-xl ${overdueInvoices.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${overdueInvoices.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatCurrency(totalOverdueAmount)}
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-rose-600 font-medium">{overdueInvoices.length} invoices past due</span>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-sky-600 hover:text-sky-700 hover:underline font-semibold"
            >
              Chase Now &rarr;
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-50/50 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Middle Section: Frequency Breakdown & Overdue Chase Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency & Plan Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Billing Frequencies</span>
            <span className="text-xs font-normal text-slate-500">Live Mix</span>
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Monthly Plans', count: frequencyStats.MONTHLY, color: 'bg-lime-500' },
              { label: 'Yearly Contracts', count: frequencyStats.YEARLY, color: 'bg-emerald-500' },
              { label: 'Weekly Pilots', count: frequencyStats.WEEKLY, color: 'bg-cyan-500' },
              { label: 'Daily Compute', count: frequencyStats.DAILY, color: 'bg-slate-800' },
            ].map((item) => {
              const pct = subscriptions.length > 0 ? Math.round((item.count / subscriptions.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-semibold">{item.count} subs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Auto-renew & Pause Policies</span>
            <button
              onClick={() => onNavigate('plans')}
              className="text-sky-600 font-semibold hover:text-sky-700 hover:underline"
            >
              Configure Plans &rarr;
            </button>
          </div>
        </div>

        {/* Overdue Invoices At-a-Glance Alert Box */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Overdue Invoices Requiring Follow-Up</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              The billing engine automatically flags invoices whose due date has lapsed without full payment.
            </p>

            {overdueInvoices.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Zero Overdue Invoices!</p>
                <p className="text-[11px] text-slate-400">All customer accounts are currently in good standing.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overdueInvoices.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-xs font-semibold text-slate-800">{inv.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Due: <span className="text-rose-600 font-semibold">{formatDate(inv.dueDate)}</span> • Sub:{' '}
                        {inv.subscriptionNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-600">{formatCurrency(inv.amountDue)}</div>
                      <button
                        onClick={() => onNavigate('payments')}
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                      >
                        Record Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Payment Methods: Bank Transfer, Credit Card, UPI</span>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-sky-600 font-semibold hover:text-sky-700 hover:underline"
            >
              View Invoicing Ledger &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions & Recent Payments Quick Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Subscriptions</h2>
            <button
              onClick={() => onNavigate('subscriptions')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              View All &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {subscriptions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{sub.customerName}</div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-mono font-medium">{sub.subscriptionNumber}</span> • {sub.planName}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      sub.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'QUOTATION'
                        ? 'bg-amber-100 text-amber-800'
                        : sub.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : sub.status === 'CLOSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <div className="text-[11px] font-bold text-slate-900 mt-0.5">
                    {formatCurrency(sub.grandTotal)}/{sub.billingFrequency.toLowerCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payment Receipts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Latest Collected Payments</h2>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              View All &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {payments.slice(0, 4).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{pay.customerName}</div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-mono">{pay.paymentNumber}</span> • Inv {pay.invoiceNumber} •{' '}
                    <span className="font-medium text-slate-700">{pay.method}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{formatCurrency(pay.amount)}</div>
                  <div className="text-[10px] text-slate-400">{formatDate(pay.paymentDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
