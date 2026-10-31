'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Building2,
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Receipt,
  TrendingUp,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN' | 'STAFF'>('ADMIN');

  // Quick Evaluator Sandbox Auto-fill
  const handleQuickSelect = (type: 'CUSTOMER' | 'ADMIN' | 'STAFF') => {
    setIsSignUp(false);
    setError(null);
    setRole(type);
    if (type === 'ADMIN') {
      setEmail('admin@brightloop.io');
      setPassword('AdminPassword@2026');
    } else if (type === 'CUSTOMER') {
      setEmail('rajesh@nexusretail.in');
      setPassword('NexusCustomer@2026');
    } else if (type === 'STAFF') {
      setEmail('sarah.sales@brightloop.io');
      setPassword('SalesPassword@2026');
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

      setSuccessMsg(isSignUp ? 'Account created! Launching workspace...' : 'Verified! Launching workspace...');

      setTimeout(() => {
        if (data.user.role === 'CUSTOMER') {
          router.push('/portal');
        } else if (data.user.role === 'STAFF') {
          router.push('/subscriptions');
        } else {
          router.push('/');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ========================================================= */}
      {/* LEFT COLUMN: Clean White Auth Terminal                    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-14 lg:p-20 max-w-2xl mx-auto w-full lg:max-w-none">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-purple-600/20">
            BL
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Brightloop
          </span>
        </div>

        {/* Auth Box */}
        <div className="my-auto py-8 max-w-md w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? 'Create enterprise account' : 'Sign in'}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              {isSignUp
                ? 'Register to manage subscriptions, quotas, and GST invoicing'
                : 'Sign in to continue to Brightloop Billing Platform'}
            </p>
          </div>

          {/* Evaluator Sandbox Access Cards */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">
                Evaluator Sandbox Access
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                Demo data
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Pick a role to auto-fill sandbox credentials:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Customer */}
              <button
                type="button"
                onClick={() => handleQuickSelect('CUSTOMER')}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 ${
                  role === 'CUSTOMER' && email === 'rajesh@nexusretail.in'
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">Customer Portal</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Invoices &amp; plans</div>
                </div>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickSelect('ADMIN')}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 ${
                  role === 'ADMIN' && email === 'admin@brightloop.io'
                    ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">Admin Console</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Full ERP access</div>
                </div>
              </button>

              {/* Employee */}
              <button
                type="button"
                onClick={() => handleQuickSelect('STAFF')}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 ${
                  role === 'STAFF' && email === 'sarah.sales@brightloop.io'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">Employee / Sales</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Quotes &amp; pipeline</div>
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Mehta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Green Logistics Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="keepSignedIn" className="text-xs text-slate-600 select-none">
                  Keep me signed in
                </label>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : isSignUp ? 'Create account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-purple-600 font-bold">Sign in</span></>
                ) : (
                  <>Don&apos;t have an account? <span className="text-purple-600 font-bold">Create account</span></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; 2026 Brightloop Inc.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms</span>
            <span className="hover:text-slate-600 cursor-pointer">Help</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: Soft Light-Purple Enterprise Showcase       */}
      {/* ========================================================= */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-50/60 via-indigo-50/40 to-slate-100 p-16 flex-col justify-between border-l border-slate-200">
        {/* Top Header Tag */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm mb-6">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            SOC 2 Type II &bull; GST compliant
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-lg">
            Recurring revenue, billed on autopilot.
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-md">
            Subscriptions, quotes, invoicing and tax &mdash; unified in one ledger your finance team can trust.
          </p>
        </div>

        {/* Preview Card */}
        <div className="my-auto max-w-md w-full">
          <div className="bg-white rounded-3xl p-7 shadow-xl shadow-purple-900/5 border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Live MRR
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  $10,220.77
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                +14.2%
              </span>
            </div>

            {/* Mini Bar Chart Preview */}
            <div className="flex items-end gap-2 h-16 pt-2">
              <div className="flex-1 bg-purple-100 rounded-lg h-6"></div>
              <div className="flex-1 bg-purple-100 rounded-lg h-8"></div>
              <div className="flex-1 bg-purple-200 rounded-lg h-10"></div>
              <div className="flex-1 bg-purple-200 rounded-lg h-9"></div>
              <div className="flex-1 bg-purple-300 rounded-lg h-12"></div>
              <div className="flex-1 bg-purple-300 rounded-lg h-11"></div>
              <div className="flex-1 bg-purple-400 rounded-lg h-13"></div>
              <div className="flex-1 bg-purple-600 rounded-lg h-16 shadow-md shadow-purple-600/30"></div>
            </div>

            {/* Two Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Tax engine</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                  18% GST <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">AUTO</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Collection rate</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  98.6%
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Brightloop closed our month-end in hours, not days. GST is calculated on every invoice automatically, and our MRR is finally a number we can trust.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-3.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Rajesh Sharma</div>
                  <div className="text-[10px] text-slate-400">VP of Finance at Nexus Retail</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty bottom spacer for layout symmetry */}
        <div></div>
      </div>
    </div>
  );
}
