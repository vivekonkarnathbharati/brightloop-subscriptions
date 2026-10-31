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
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN' | 'STAFF'>('CUSTOMER');

  // Quick Demo Autofill for Evaluators
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

      setSuccessMsg(isSignUp ? 'Account created! Redirecting...' : 'Signed in! Redirecting...');

      // Smart role-based redirection
      setTimeout(() => {
        if (data.user.role === 'CUSTOMER') {
          router.push('/portal');
        } else if (data.user.role === 'STAFF') {
          router.push('/subscriptions');
        } else {
          router.push('/');
        }
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto my-auto">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"></div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              BL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">Brightloop</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                  Billing Platform
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isSignUp ? 'Create your account' : 'Sign in'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isSignUp
                ? 'Register to start managing enterprise recurring contracts'
                : 'to continue to Brightloop Subscription & Billing ERP'}
            </p>
          </div>

          {/* Quick Evaluator / Demo Role Selectors */}
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-400 mb-2">
              Select a portal or pre-fill verified demo credentials:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickSelect('CUSTOMER')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-purple-500/40 transition text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Customer</span>
                <span className="text-[10px] text-slate-500">Nexus Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('ADMIN')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-purple-500/40 transition text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Admin</span>
                <span className="text-[10px] text-slate-500">HQ Console</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('STAFF')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-purple-500/40 transition text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Employee</span>
                <span className="text-[10px] text-slate-500">Sales Rep</span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Mehta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Green Logistics Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="CUSTOMER">Customer (Self-service billing)</option>
                    <option value="STAFF">Sales Staff (Quotation & pipeline)</option>
                    <option value="ADMIN">System Administrator (Full ERP access)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
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
                className="text-xs text-purple-400 hover:text-purple-300 font-medium transition"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Create account'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 mt-6">
        Brightloop Software &bull; Odoo Hackathon &apos;26 Submission &bull; Powered by Next.js &amp; Prisma
      </footer>
    </div>
  );
}
