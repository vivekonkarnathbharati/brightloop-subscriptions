'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { Role } from '@/lib/types';
import { validatePassword } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  ShieldAlert,
  Briefcase,
  Building2,
  AlertCircle,
  Check,
  X,
  Lock,
  Mail,
  Smartphone,
  BadgeCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function SignInPage() {
  const { loginWithEmail, registerCustomer, addNotification, users } = useBrightloop();

  // Selected Portal Mode: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');

  // Mode: 'signin' | 'forgot' | 'signup'
  const [mode, setMode] = useState<'signin' | 'forgot' | 'signup'>('signin');

  // Signin fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotDispatched, setForgotDispatched] = useState(false);

  // Signup fields (Customer only)
  const [signupCompany, setSignupCompany] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Password validation for signup
  const valResult = validatePassword(signupPassword);
  const isEmailTaken = users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase());

  // Handle switching portals (DOES NOT AUTO-LOGIN, JUST SWITCHES MODE)
  const handleSelectPortal = (role: Role) => {
    setSelectedRole(role);
    setLoginError('');
    setIdentifier('');
    setPassword('');
  };

  // Pre-fill demo credentials helper for evaluators
  const handlePreFillDemo = () => {
    setLoginError('');
    if (selectedRole === 'ADMIN') {
      setIdentifier('BL-ADM-001');
      setPassword('AdminPassword@2026');
    } else if (selectedRole === 'STAFF') {
      setIdentifier('BL-EMP-104');
      setPassword('SalesPassword@2026');
    } else {
      setIdentifier('liam@acmecorp.com');
      setPassword('NexusCustomer@2026');
    }
  };

  // Handle Standard Official Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      if (selectedRole === 'CUSTOMER') {
        setLoginError('Please enter your email or mobile number.');
      } else if (selectedRole === 'ADMIN') {
        setLoginError('Corporate Admin ID or official email is required.');
      } else {
        setLoginError('Employee Staff ID or official email is required.');
      }
      return;
    }

    if (!password) {
      setLoginError('Password is required.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = loginWithEmail(identifier, password, selectedRole);
      setLoading(false);
      if (!res.success) {
        setLoginError(res.error || 'Invalid credentials. Access denied.');
      }
    }, 400);
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotDispatched(true);
    addNotification(`A reset link has been dispatched to ${forgotEmail}`, 'info');
  };

  // Handle Customer Signup
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return;

    const res = registerCustomer(signupName, signupEmail, signupPassword, signupCompany);
    if (!res.success) {
      // Handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#bae6fd] selection:text-[#0c4a6e]">
      {/* Spacer to keep card centered */}
      <div className="hidden sm:block h-4" />

      {/* Main Container */}
      <div className="w-full max-w-[1040px] bg-white rounded-[28px] border border-[#dadce0] p-8 sm:p-10 md:p-12 shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_8px_3px_rgba(60,64,67,0.05)] transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Brand Identity & Portal Context              */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Electric Fintech Brand Logo */}
              <div className="mb-6">
                <BrightloopLogo size={46} palette="fintech" />
              </div>

              {/* Dynamic Heading based on Portal and Mode */}
              {mode === 'signin' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedRole === 'CUSTOMER' && '🏢 Customer Self-Service Portal'}
                    {selectedRole === 'ADMIN' && '🛡️ Corporate Admin Console'}
                    {selectedRole === 'STAFF' && '💼 Internal Employee Sales Portal'}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-semibold text-[#1f1f1f] tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-sm text-[#444746] mt-2 leading-relaxed">
                    {selectedRole === 'CUSTOMER' &&
                      'Enter your registered email address or phone number to access your invoices, active plans, and pay online.'}
                    {selectedRole === 'ADMIN' &&
                      'High-security administrative access. Authorized Admin ID and executive security credentials required.'}
                    {selectedRole === 'STAFF' &&
                      'Sales staff and account managers portal. Enter your official Employee ID and staff password.'}
                  </p>
                </>
              )}

              {mode === 'forgot' && (
                <>
                  <h1 className="text-3xl md:text-4xl font-normal text-[#1f1f1f] tracking-tight">
                    Account recovery
                  </h1>
                  <p className="text-base text-[#444746] mt-2">
                    Recover your Brightloop business account
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <>
                  <h1 className="text-3xl md:text-4xl font-normal text-[#1f1f1f] tracking-tight">
                    Create a Customer Account
                  </h1>
                  <p className="text-base text-[#444746] mt-2">
                    Enter your company and personal details to sign up
                  </p>
                </>
              )}
            </div>

            {/* Security Badges */}
            <div className="hidden md:block pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Role-Based Access Control (RBAC) &bull; 18% GST Compliance</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Odoo x FLUX Lucknow Hackathon &apos;26 &bull; Brightloop Enterprise Billing
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Official Login Form Content                */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between space-y-6">
            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <div className="space-y-6">
                {/* 3 Portal Selectors (DOES NOT AUTO-LOG IN, ONLY SWITCHES SELECTION) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Select Access Portal:
                    </span>
                    <button
                      type="button"
                      onClick={handlePreFillDemo}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                      title="Auto-fill sample credentials for evaluation"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Pre-fill Demo Credentials
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Customer */}
                    <button
                      type="button"
                      onClick={() => handleSelectPortal('CUSTOMER')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                        selectedRole === 'CUSTOMER'
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
                        selectedRole === 'CUSTOMER'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-xs ${selectedRole === 'CUSTOMER' ? 'text-blue-900' : 'text-slate-800'}`}>
                        Customer
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Email / Phone</span>
                    </button>

                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => handleSelectPortal('ADMIN')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                        selectedRole === 'ADMIN'
                          ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
                        selectedRole === 'ADMIN'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-xs ${selectedRole === 'ADMIN' ? 'text-purple-900' : 'text-slate-800'}`}>
                        Admin
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">ID &amp; Password</span>
                    </button>

                    {/* Employee / Sales Staff */}
                    <button
                      type="button"
                      onClick={() => handleSelectPortal('STAFF')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                        selectedRole === 'STAFF'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
                        selectedRole === 'STAFF'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-xs ${selectedRole === 'STAFF' ? 'text-emerald-900' : 'text-slate-800'}`}>
                        Employee
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Staff ID</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Official Form Inputs */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Field 1: Dynamic Label & Placeholder */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {selectedRole === 'CUSTOMER' && 'Customer Email or Mobile Number'}
                      {selectedRole === 'ADMIN' && 'Corporate Admin ID or Official Email'}
                      {selectedRole === 'STAFF' && 'Employee Staff ID or Corporate Email'}
                    </label>
                    <div className="relative">
                      {selectedRole === 'CUSTOMER' ? (
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      )}
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === 'CUSTOMER'
                            ? 'e.g. liam@acmecorp.com or +91 98201 12345'
                            : selectedRole === 'ADMIN'
                            ? 'e.g. BL-ADM-001 or admin@brightloop.io'
                            : 'e.g. BL-EMP-104 or sales@brightloop.io'
                        }
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password with Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {selectedRole === 'CUSTOMER' ? 'Customer Password' : 'Security Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
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

                  {/* Actions Row */}
                  <div className="pt-2 flex items-center justify-between">
                    {selectedRole === 'CUSTOMER' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setLoginError('');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Create customer account
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Corporate intranet credentials
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="space-y-6">
                {forgotDispatched ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Reset Link Dispatched
                    </div>
                    <p className="text-xs">
                      We have sent password reset instructions to <strong>{forgotEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        className="w-full px-3.5 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                      >
                        Back to sign in
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        Send Recovery Link
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 3. SIGN UP FORM (Customer Only) */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Chen"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. liam@acmecorp.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 8 chars with mixed case & symbol"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Already have an account? Sign in
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[1040px] flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 pt-6 px-4 gap-2">
        <span>&copy; 2026 Brightloop Billing Platform &bull; All Rights Reserved</span>
        <div className="flex gap-4 font-medium">
          <span className="hover:text-slate-800 cursor-pointer">Security Policy</span>
          <span className="hover:text-slate-800 cursor-pointer">GST Compliance</span>
          <span className="hover:text-slate-800 cursor-pointer">Help Center</span>
        </div>
      </div>
    </div>
  );
}
