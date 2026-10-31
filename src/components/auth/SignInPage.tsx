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
} from 'lucide-react';

export function SignInPage() {
  const { loginWithRole, loginWithEmail, registerCustomer, addNotification, users } = useBrightloop();

  // Mode: 'signin' | 'forgot' | 'signup'
  const [mode, setMode] = useState<'signin' | 'forgot' | 'signup'>('signin');

  // Signin fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  // Theme Accents
  const buttonTheme =
    'bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white shadow-md shadow-[#C29367]/20';
  const linkTheme = 'text-[#9C6638] hover:text-[#7A4B20]';

  // Handle Standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier) {
      setLoginError('Enter an email or phone number');
      return;
    }

    const res = loginWithEmail(identifier, password);
    if (!res.success) {
      setLoginError(res.error || 'Wrong credentials. Try again or click Forgot password.');
    }
  };

  // Handle 1-Click Role Login (Customer / Admin / Employee)
  const handleRoleQuickLogin = (role: Role) => {
    loginWithRole(role);
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

      {/* Main Google-Styled Container */}
      <div className="w-full max-w-[1040px] bg-white rounded-[28px] border border-[#dadce0] p-8 sm:p-10 md:p-12 shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_8px_3px_rgba(60,64,67,0.05)] transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          {/* LEFT COLUMN: Brand Logo & Heading */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Electric Fintech Brand Logo */}
              <div className="mb-6">
                <BrightloopLogo size={46} palette="fintech" />
              </div>

              {/* Dynamic Heading based on Mode */}
              {mode === 'signin' && (
                <>
                  <h1 className="text-3xl md:text-4xl font-normal text-[#1f1f1f] tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-base text-[#444746] mt-2">
                    to continue to Brightloop Billing Platform
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
                    Enter your company and personal details
                  </p>
                </>
              )}
            </div>

            {/* Google Guest Mode Info Box */}
            <div className="hidden md:block text-xs text-[#444746] leading-relaxed pt-6">
              <p>
                Not your computer? Use Guest mode to sign in privately.{' '}
                <span className={`${linkTheme} font-medium cursor-pointer hover:underline`}>
                  Learn more about using Guest mode
                </span>
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Form Content */}
          <div className="flex flex-col justify-between space-y-6">
            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <div className="space-y-6">
                {/* 3 Quick Role Selection Options (Customer / Admin / Employee) */}
                <div>
                  <div className="text-xs font-medium text-[#444746] mb-2.5">
                    Select a login portal or sign in with credentials:
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Customer */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('CUSTOMER')}
                      className="p-3 rounded-2xl border border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE] flex flex-col items-center justify-center text-center transition-all group"
                      title="1-click sign in to Customer Portal (Liam Chen)"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C29367] to-[#B88457] text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-sm shadow-[#C29367]/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#2C2621]">Customer</span>
                      <span className="text-[10px] text-[#7A6D61] font-medium">Portal</span>
                    </button>

                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('ADMIN')}
                      className="p-3 rounded-2xl border border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE] flex flex-col items-center justify-center text-center transition-all group"
                      title="1-click sign in to Admin Console (Alice Vance)"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C29367] to-[#B88457] text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-sm shadow-[#C29367]/20">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#2C2621]">Admin</span>
                      <span className="text-[10px] text-[#7A6D61] font-medium">Console</span>
                    </button>

                    {/* Employee / Sales Staff */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('STAFF')}
                      className="p-3 rounded-2xl border border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE] flex flex-col items-center justify-center text-center transition-all group"
                      title="1-click sign in as Sales Rep (Sam Miller)"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C29367] to-[#B88457] text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-sm shadow-[#C29367]/20">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#2C2621]">Employee</span>
                      <span className="text-[10px] text-[#7A6D61] font-medium">Sales Rep</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 bg-[#fce8e6] border border-[#fad2cf] rounded-xl text-[#c5221f] text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#c5221f]" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        id="identifier"
                        placeholder="Email or phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className={`text-sm font-medium ${linkTheme} hover:underline transition-colors`}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-6 mt-4">
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`text-sm font-medium ${linkTheme} hover:bg-slate-100 px-3 py-2 rounded-full transition-colors`}
                    >
                      Create account
                    </button>

                    <button
                      type="submit"
                      className={`${buttonTheme} font-medium text-sm px-7 py-2.5 rounded-full transition-all active:scale-95`}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. FORGOT PASSWORD VIEW */}
            {mode === 'forgot' && (
              <div className="space-y-6">
                <p className="text-sm text-[#444746]">
                  Enter your registered Brightloop email to receive a password reset link.
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Email or phone"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                    />
                  </div>

                  {forgotDispatched && (
                    <div className="p-3.5 bg-[#e0f2fe] border border-[#bae6fd] rounded-xl text-[#0369a1] text-xs space-y-1 animate-in fade-in">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0284C7]" />
                        Reset email sent!
                      </div>
                      <p className="text-[#3c4043] text-[11px]">
                        Check your inbox at <span className="font-medium">{forgotEmail}</span>.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setForgotDispatched(false);
                      }}
                      className="text-sm font-medium text-[#444746] hover:bg-slate-100 px-3 py-2 rounded-full transition-colors"
                    >
                      Back to sign in
                    </button>

                    <button
                      type="submit"
                      className={`${buttonTheme} font-medium text-sm px-7 py-2.5 rounded-full transition-all`}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. SIGN UP VIEW */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#0284C7] rounded-md text-sm text-[#1f1f1f] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Contact name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#0284C7] rounded-md text-sm text-[#1f1f1f] outline-none"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="Work email address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-md text-sm text-[#1f1f1f] outline-none ${
                      isEmailTaken ? 'border-[#c5221f] bg-[#fce8e6]/30' : 'border-[#747775] focus:border-[#0284C7]'
                    }`}
                  />
                  {isEmailTaken && (
                    <p className="text-[11px] text-[#c5221f] mt-1 font-medium">
                      That email is already taken. Try another or sign in.
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Password (> 8 chars)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#0284C7] rounded-md text-sm text-[#1f1f1f] outline-none font-mono"
                  />

                  {/* Requirements checklist */}
                  <div className="mt-2.5 p-3 bg-[#f0f9ff] rounded-xl border border-[#bae6fd] space-y-1 text-xs text-[#0369a1]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] mb-1">
                      Password Requirements:
                    </div>

                    <div className="flex items-center gap-1.5">
                      {valResult.hasMinLength ? (
                        <Check className="w-3.5 h-3.5 text-[#0284c7]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#94a3b8]" />
                      )}
                      <span className={valResult.hasMinLength ? 'text-[#0284c7] font-medium' : 'text-slate-500'}>
                        More than 8 characters (current: {signupPassword.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {valResult.hasUppercase ? (
                        <Check className="w-3.5 h-3.5 text-[#0284c7]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#94a3b8]" />
                      )}
                      <span className={valResult.hasUppercase ? 'text-[#0284c7] font-medium' : 'text-slate-500'}>
                        At least one uppercase letter (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {valResult.hasLowercase ? (
                        <Check className="w-3.5 h-3.5 text-[#0284c7]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#94a3b8]" />
                      )}
                      <span className={valResult.hasLowercase ? 'text-[#0284c7] font-medium' : 'text-slate-500'}>
                        At least one lowercase letter (a-z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {valResult.hasSpecialChar ? (
                        <Check className="w-3.5 h-3.5 text-[#0284c7]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#94a3b8]" />
                      )}
                      <span className={valResult.hasSpecialChar ? 'text-[#0284c7] font-medium' : 'text-slate-500'}>
                        At least one special character (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-sm font-medium text-[#444746] hover:bg-slate-100 px-3 py-2 rounded-full transition-colors"
                  >
                    Sign in instead
                  </button>

                  <button
                    type="submit"
                    disabled={!valResult.isValid || isEmailTaken}
                    className={`${buttonTheme} font-medium text-sm px-7 py-2.5 rounded-full transition-all`}
                  >
                    Next
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER: Utility Links */}
      <footer className="w-full max-w-[1040px] flex flex-row items-center justify-end text-xs text-[#444746] py-4 px-4 gap-6 mt-4">
        {/* Links */}
        <div className="flex items-center gap-6">
          <span className="hover:bg-[#e9eef6] px-2 py-1 rounded cursor-pointer transition-colors">
            Help
          </span>
          <span className="hover:bg-[#e9eef6] px-2 py-1 rounded cursor-pointer transition-colors">
            Privacy
          </span>
          <span className="hover:bg-[#e9eef6] px-2 py-1 rounded cursor-pointer transition-colors">
            Terms
          </span>
        </div>
      </footer>
    </div>
  );
}
