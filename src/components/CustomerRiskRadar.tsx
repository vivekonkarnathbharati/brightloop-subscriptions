'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';

export default function CustomerRiskRadar() {
  const [mitigatingCustomer, setMitigatingCustomer] = useState<any>(null);
  const [mitigationSuccess, setMitigationSuccess] = useState<string | null>(null);

  const customerProfiles = [
    {
      id: 'cust-1',
      company: 'Nexus Retail Enterprises',
      contact: 'Rajesh Sharma',
      score: 94,
      status: 'HEALTHY',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      reason: 'Prompt payer (IMPS HDFC), Enterprise White-label Edition, auto-renew enabled.',
      exposure: '$8,491 / mo',
      actionLabel: 'Loyalty Upgrade',
    },
    {
      id: 'cust-2',
      company: 'CloudPulse Technologies Pvt Ltd',
      contact: 'Ananya Desai',
      score: 58,
      status: 'CRITICAL RISK',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      reason: 'Invoice INV-2026-0002 overdue (16 days). Annual renewal pending clearance.',
      exposure: '$14,750 at risk',
      actionLabel: '⚡ Trigger Smart Dunning & 10% Early Settlement',
      isAtRisk: true,
    },
    {
      id: 'cust-3',
      company: 'Green Logistics Express',
      contact: 'Vikram Mehta',
      score: 76,
      status: 'MODERATE',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      reason: 'Quotation SUB-2026-0003 pending sign-off on 15-day validity window.',
      exposure: '$10,478 pipeline',
      actionLabel: 'Accelerate Quote',
    },
  ];

  const handleMitigate = (cust: any) => {
    setMitigatingCustomer(cust);
  };

  const confirmMitigation = () => {
    setMitigationSuccess(
      `Autonomous recovery protocol initiated for ${mitigatingCustomer.company}: 10% Settlement incentive dispatched via WhatsApp & Email with instant UPI payment deep link.`
    );
    setMitigatingCustomer(null);
    setTimeout(() => setMitigationSuccess(null), 5000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Customer Risk & Churn Radar
            </h3>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold">
              Proactive Health Scoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic churn risk detection based on payment timeliness, mandate failures, and renewal proximity.
          </p>
        </div>

        {mitigationSuccess && (
          <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mitigationSuccess}</span>
          </div>
        )}
      </div>

      {/* Customer Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customerProfiles.map((cust) => (
          <div
            key={cust.id}
            className={`border rounded-xl p-5 flex flex-col justify-between transition ${
              cust.isAtRisk
                ? 'bg-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-950/40'
                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{cust.company}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">Contact: {cust.contact}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tracking-tight text-white">{cust.score}/100</div>
                  <span
                    className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-block ${cust.statusColor}`}
                  >
                    {cust.status}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <p className="text-[11px] text-slate-300 mt-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {cust.reason}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Exposure</div>
                <div className="text-xs font-bold text-white">{cust.exposure}</div>
              </div>

              {cust.isAtRisk ? (
                <button
                  onClick={() => handleMitigate(cust)}
                  className="text-[11px] font-semibold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Auto-Mitigate
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Stable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mitigation Action Modal */}
      {mitigatingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">
                  Autonomous Risk Mitigation Protocol
                </h3>
              </div>
              <button
                onClick={() => setMitigatingCustomer(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-300">
              <p>
                Initiating immediate retention and cashflow recovery for{' '}
                <strong className="text-white">{mitigatingCustomer.company}</strong> ($14,750 overdue balance).
              </p>

              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <div className="font-semibold text-slate-200 text-xs">Automated Actions to Trigger:</div>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Generate one-time <strong>10% Early Settlement Discount</strong> code ($1,475 off if paid in 48h).
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Dispatch dynamic <strong>Instant UPI & Razorpay/Stripe Autopay</strong> recovery links.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Activate a <strong>7-Day Soft-Grace Period</strong> to prevent service disruption while payment settles.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setMitigatingCustomer(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmMitigation}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition"
              >
                🚀 Confirm & Dispatch Mitigation Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
