'use client';

import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function SmartRevenueWaterfall() {
  const waterfallSteps = [
    {
      label: 'Starting MRR',
      amount: '$6,500',
      type: 'baseline',
      detail: 'Carryover from prior month',
      color: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      label: '+ New MRR',
      amount: '+$4,800',
      type: 'positive',
      detail: '2 Enterprise contract signups',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: '+ Expansion MRR',
      amount: '+$1,120',
      type: 'positive',
      detail: 'Enterprise White-label Edition (+ $850/seat delta)',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      label: '- Churn & Contraction',
      amount: '$0.00',
      type: 'neutral',
      detail: 'Zero churn recorded this cycle',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      label: '= Net Current MRR',
      amount: '$12,420',
      type: 'total',
      detail: '+18.4% MoM Net Growth Rate',
      color: 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-500/40',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Smart MRR Waterfall & Revenue Engine
            </h3>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
              Live AI Audit
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise expansion attribution, platform variant delta, and net retention breakdown.
          </p>
        </div>

        {/* DSO Health Badge */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Days Sales Outstanding (DSO)
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              14.2 Days <span className="text-[10px] font-normal text-slate-400">(Benchmark &lt; 30d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall Steps Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {waterfallSteps.map((step, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-4 flex flex-col justify-between transition hover:border-slate-600 ${step.color}`}
          >
            <div>
              <div className="text-[11px] font-semibold tracking-wide uppercase opacity-80">
                {step.label}
              </div>
              <div className="text-xl font-extrabold mt-1 tracking-tight">
                {step.amount}
              </div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-2 border-t border-current/10">
              {step.detail}
            </div>
          </div>
        ))}
      </div>

      {/* 90-Day Predictive Cashflow Projections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">30-Day Guaranteed Run-Rate</div>
          <div className="text-lg font-bold text-white mt-1">$12,420</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            100% committed contracts
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">60-Day Projected Revenue</div>
          <div className="text-lg font-bold text-white mt-1">$24,840</div>
          <div className="text-[11px] text-purple-400 flex items-center gap-1 mt-1">
            <Sparkles className="w-3 h-3" />
            Includes +$1,120 Enterprise Edition Delta
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">90-Day Pipeline Forecast</div>
          <div className="text-lg font-bold text-white mt-1">$35,318</div>
          <div className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            +Green Logistics Quote Conversion
          </div>
        </div>
      </div>
    </div>
  );
}
