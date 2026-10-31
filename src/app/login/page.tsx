'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building,
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  Receipt,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN' | 'STAFF'>('ADMIN');

  // Evaluator Quick Fast-Track
  const handleQuickSelect = (type: 'CUSTOMER' | 'ADMIN' | 'STAFF') => {
    setIsSignUp(false);
    setError(null);
    if (type === 'ADMIN') {
      setEmail('admin@brightloop.io');
      setPassword('AdminPassword@2026');
      setRole('ADMIN');
    } else if (type === 'CUSTOMER') {
      setEmail('rajesh@nexusretail.in');
      setPassword('NexusCustomer@2026');
      setRole('CUSTOMER');
    } else if (type === 'STAFF') {
      setEmail('sarah.sales@brightloop.io');
      setPassword('SalesPassword@2026');
      setRole('STAFF');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? { name, email, password, companyName, role }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save user session
      localStorage.setItem('brightloop_user', JSON.stringify(data.user));
      localStorage.setItem('brightloop_role', data.user.role);

      setSuccessMsg(isSignUp ? 'Account created! Redirecting to workspace...' : 'Verified! Launching workspace...');

      setTimeout(() => {
        if (data.user.role === 'CUSTOMER') {
          router.push('/portal');
        } else if (data.user.role === 'STAFF') {
          router.push('/subscriptions');
        } else {
          router.push('/');
        }
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-purple-500/30">
      {/* LEFT COLUMN: The Clean Enterprise Auth Terminal */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full lg:max-w-none">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-purple-500/20">
              BL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Brightloop</span>
                <span className="text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase">
                  Enterprise ERP
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Systems Operational
          </div>
        </div>

        {/* Auth Body */}
        <div className="my-auto py-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isSignUp ? 'Create your enterprise workspace' : 'Welcome back to Brightloop'}
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {isSignUp
                ? 'Join thousands of SaaS & ERP teams scaling recurring revenue'
                : 'Access the unified subscription lifecycle, GST billing & revenue engine'}
            </p>
          </div>

          {/* Evaluator Fast-Track Section */}
          <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Evaluator Sandbox Access:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Fast Track</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('ADMIN')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition ${
                  role === 'ADMIN' && email === 'admin@brightloop.io'
                    ? 'border-purple-500 bg-purple-500/15 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-xs font-semibold">Admin</span>
                <span className="text-[10px] text-slate-400">HQ Console</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('STAFF')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition ${
                  role === 'STAFF' && email === 'sarah.sales@brightloop.io'
                    ? 'border-indigo-500 bg-indigo-500/15 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-xs font-semibold">Sales Staff</span>
                <span className="text-[10px] text-slate-400">Quotes &amp; CRM</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('CUSTOMER')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition ${
                  role === 'CUSTOMER' && email === 'rajesh@nexusretail.in'
                    ? 'border-emerald-500 bg-emerald-500/15 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-xs font-semibold">Customer</span>
                <span className="text-[10px] text-slate-400">Client Portal</span>
              </button>
            </div>
          </div>

          {/* Error & Success Banners */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Mehta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Organization / Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Retail Enterprises"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Account Classification
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="CUSTOMER">Customer Account (Access self-service portal)</option>
                    <option value="STAFF">Sales &amp; Account Staff (Build quotes &amp; manage deals)</option>
                    <option value="ADMIN">Enterprise Administrator (Global finance &amp; billing engine)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
              >
                {isSignUp ? 'Already registered? Sign In' : 'Create new enterprise account'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Workspace' : 'Sign In to Platform'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Compliance Footer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>256-bit TLS Encryption &bull; Role-Based Security</span>
          </div>
          <div>Odoo x FLUX Hackathon &apos;26</div>
        </div>
      </div>

      {/* RIGHT COLUMN: The High-End Enterprise Showcase Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 p-16 flex-col justify-between border-l border-slate-800/80 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Feature Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-purple-300 mb-6">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Automated Billing &bull; Anti-Double Billing Engine
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            The Digital Operating System for Recurring Enterprise Revenue.
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-lg">
            Say goodbye to spreadsheet leakage. Automate quotation approvals, multi-tier brand variants, 18% GST invoicing, and real-time MRR ledger sync.
          </p>
        </div>

        {/* Interactive Live Preview Mockup Card */}
        <div className="my-auto relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-6 shadow-2xl space-y-4 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  MRR
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Monthly Recurring Revenue</div>
                  <div className="text-[10px] text-emerald-400 font-medium">+14.2% Growth vs Last Period</div>
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">$10,220.77</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="text-[11px] text-slate-400">GST Invoice Engine</div>
                <div className="text-sm font-bold text-white mt-0.5">18.0% Auto-Applied</div>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Duplicate-Proof
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="text-[11px] text-slate-400">Variant Price Delta</div>
                <div className="text-sm font-bold text-white mt-0.5">+$560.00</div>
                <div className="text-[10px] text-purple-300 mt-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Odoo Brand Tier
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-[11px]">Ready for 05:30 PM Grand Evaluation</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">OD-2026-FLUX</span>
            </div>
          </div>
        </div>

        {/* Enterprise Testimonial / Social Proof */}
        <div className="relative z-10 pt-6 border-t border-slate-800/60">
          <p className="text-xs text-slate-400 italic leading-relaxed">
            &ldquo;Brightloop replaced four separate tools across quotation generation, GST invoicing, and UPI payment reconciliations. We eliminated double-billing completely.&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-[10px] text-white">
              RS
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Rajesh Sharma</div>
              <div className="text-[10px] text-slate-500">VP of Finance &bull; Nexus Retail Enterprises</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
