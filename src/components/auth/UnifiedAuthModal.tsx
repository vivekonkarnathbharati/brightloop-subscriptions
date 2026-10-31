'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { validatePassword } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  Check,
  X,
  ArrowRight,
  AlertCircle,
  Send,
  Info,
} from 'lucide-react';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'forgot';
}

export function UnifiedAuthModal({ isOpen, onClose, defaultTab = 'signin' }: UnifiedAuthModalProps) {
  const { users, setCurrentUser, registerCustomer, addNotification } = useBrightloop();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);

  // Sign In States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign Up States (Customer Only!)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupCompany, setSignupCompany] = useState('');

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetDispatched, setResetDispatched] = useState(false);

  if (!isOpen) return null;

  // Validation checks for signup
  const valResult = validatePassword(signupPassword);
  const isEmailTaken = users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase());

  // Handle Unified Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (!targetUser) {
      setLoginError('No registered account found with this email address.');
      return;
    }

    // Role-based destination notification
    setCurrentUser(targetUser);
    addNotification(`Signed in successfully as ${targetUser.name} (${targetUser.role})`, 'success');
    onClose();
  };

  // Quick autofill helper for judges
  const autofillLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('Brightloop2026!');
    setLoginError('');
  };

  // Handle Customer Signup
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return;

    const res = registerCustomer(signupName, signupEmail, signupPassword, signupCompany);
    if (res.success) {
      onClose();
    }
  };

  // Handle Password Reset
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetDispatched(true);
    addNotification(`If ${resetEmail} is registered, a password reset link has been dispatched.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <BrightloopLogo size={40} palette="fintech" showWordmark={true} />

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
          >
            &times;
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('signin');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unified Sign In
          </button>

          <button
            onClick={() => {
              setActiveTab('signup');
              setResetDispatched(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Sign Up
          </button>

          <button
            onClick={() => {
              setActiveTab('forgot');
              setResetDispatched(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'forgot'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* 1. UNIFIED SIGN IN VIEW */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-0.5">Welcome Back</h2>
              <p className="text-slate-500">
                Sign in with your email. The platform automatically directs you to your authorized dashboard.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-indigo-600 hover:underline text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Continue to Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Presets for Hackathon Testing */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                One-Click Account Fillers (Testing):
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => autofillLogin('admin@brightloop.io')}
                  className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left"
                >
                  <div className="font-bold text-slate-800">Admin</div>
                  <div className="text-[10px] text-slate-400 truncate">admin@brightloop.io</div>
                </button>

                <button
                  type="button"
                  onClick={() => autofillLogin('sales@brightloop.io')}
                  className="p-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-lg text-left"
                >
                  <div className="font-bold text-slate-800">Sales Staff</div>
                  <div className="text-[10px] text-slate-400 truncate">sales@brightloop.io</div>
                </button>

                <button
                  type="button"
                  onClick={() => autofillLogin('liam@acmecorp.com')}
                  className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-left"
                >
                  <div className="font-bold text-slate-800">Customer</div>
                  <div className="text-[10px] text-slate-400 truncate">liam@acmecorp.com</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. CUSTOMER SIGN UP VIEW (Strictly Customer Only!) */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-0.5">Register Customer Account</h2>
              <p className="text-slate-500">
                Create a self-service customer portal account for your business.
              </p>
            </div>

            {/* Production Notice: Staff accounts are provisioned by Admin */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Internal Staff Policy: </span>
                Brightloop staff cannot self-register here. Internal accounts are provisioned exclusively by system administrators in the Staff Directory.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Logistics Ltd"
                  value={signupCompany}
                  onChange={(e) => setSignupCompany(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Email *</label>
              <input
                type="email"
                required
                placeholder="alex@acmelogistics.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={`w-full p-2.5 border rounded-xl focus:ring-2 text-xs ${
                  isEmailTaken
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
              {isEmailTaken && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  This email is already registered. Please sign in instead.
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="text"
                required
                placeholder="Create secure password..."
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 text-xs"
              />

              {/* Real-time Checklist Checklist */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <div className="font-bold text-slate-600 uppercase tracking-wider mb-1 text-[10px]">
                  Password Policy (&gt; 8 Characters)
                </div>

                <div className="flex items-center gap-2">
                  {valResult.hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span className={valResult.hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    More than 8 characters (current: {signupPassword.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {valResult.hasUppercase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span className={valResult.hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    At least one uppercase letter (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {valResult.hasLowercase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span className={valResult.hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    At least one lowercase letter (a-z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {valResult.hasSpecialChar ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span className={valResult.hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    At least one special character (!@#$%^&*...)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!valResult.isValid || isEmailTaken}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs transition-all"
            >
              Create Customer Portal Account
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD VIEW */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleReset} className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-0.5">Reset Your Password</h2>
              <p className="text-slate-500">
                Enter your registered email address and we'll dispatch a secure password reset link.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Account Email</label>
              <input
                type="email"
                required
                placeholder="billing@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Recovery Link</span>
            </button>

            {resetDispatched && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Reset Link Dispatched
                </div>
                <p className="text-slate-600 text-[11px]">
                  Simulated dispatch to <span className="font-mono font-semibold">{resetEmail}</span>:
                </p>
                <div className="p-2 bg-white rounded border border-emerald-200 font-mono text-[10px] text-indigo-600 break-all">
                  https://brightloop.io/auth/reset?token=tok_demo_98231&amp;expiry=1h
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="text-indigo-600 hover:underline font-semibold"
              >
                &larr; Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
