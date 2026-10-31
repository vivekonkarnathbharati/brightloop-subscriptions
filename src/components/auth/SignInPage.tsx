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
  Shield,
  Info,
} from 'lucide-react';

export function SignInPage() {
  const { loginWithEmail, registerCustomer, addNotification, users } = useBrightloop();

  // Mode: 'signin' | 'forgot' | 'signup'
  const [mode, setMode] = useState<'signin' | 'forgot' | 'signup'>('signin');

  // Selected Portal: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');

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
  const [signupError, setSignupError] = useState('');

  // Password validation for signup
  const valResult = validatePassword(signupPassword);
  const isEmailTaken = users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase());

  // Theme Accents (Original Golden/Bronze Brand Styling)
  const buttonTheme =
    'bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white shadow-md shadow-[#C29367]/20';
  const linkTheme = 'text-[#9C6638] hover:text-[#7A4B20]';

  // Handle switching portals (Selects mode only, does not auto-login)
  const handleSelectPortal = (role: Role) => {
    setSelectedRole(role);
    setLoginError('');
    setIdentifier('');
    setPassword('');
  };

  // Pre-fill demo credentials
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

  // Handle Standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      if (selectedRole === 'CUSTOMER') {
        setLoginError('Enter an email or phone number');
      } else if (selectedRole === 'ADMIN') {
        setLoginError('Corporate Admin ID or official email is required');
      } else {
        setLoginError('Employee Staff ID or official email is required');
      }
      return;
    }

    if (!password) {
      setLoginError('Password is required');
      return;
    }

    const res = loginWithEmail(identifier, password, selectedRole);
    if (!res.success) {
      setLoginError(res.error || 'Wrong credentials. Try again or click Forgot password.');
    }
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
    setSignupError('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setSignupError('All required fields must be filled');
      return;
    }

    if (isEmailTaken) {
      setSignupError('An account with this email already exists.');
      return;
    }

    if (!valResult.isValid) {
      setSignupError('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 special symbol');
      return;
    }

    const res = registerCustomer(signupName, signupEmail, signupPassword, signupCompany);
    if (!res.success) {
      setSignupError(res.error || 'Could not register customer');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#bae6fd] selection:text-[#0c4a6e]">
      {/* Spacer to keep card centered */}
      <div className="hidden sm:block h-4" />

      {/* Main Google-Styled Container */}
      <div className="w-full max-w-[1040px] bg-white rounded-[28px] border border-[#dadce0] p-8 sm:p-10 md:p-12 shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_8px_3px_rgba(60,64,67,0.05)] transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Brand Logo & Heading                         */}
          {/* ========================================================= */}
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
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Form Content                    */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between space-y-6">
            
            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <div className="space-y-6">
                {/* 3 Role Selection Options (Customer / Admin / Employee) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-medium text-[#444746]">
                      Select a login portal or sign in with credentials:
                    </span>
                    <button
                      type="button"
                      onClick={handlePreFillDemo}
                      className={`text-[11px] font-semibold ${linkTheme} flex items-center gap-1 transition`}
                      title="Auto-fill sample credentials for evaluation"
                    >
                      Auto-fill
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Customer */}
                    <button
                      type="button"
                      onClick={() => handleSelectPortal('CUSTOMER')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all group ${
                        selectedRole === 'CUSTOMER'
                          ? 'border-[#C29367] bg-[#F9F5EE] shadow-sm ring-2 ring-[#C29367]/20'
                          : 'border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE]'
                      }`}
                      title="Select Customer Portal"
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
                      onClick={() => handleSelectPortal('ADMIN')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all group ${
                        selectedRole === 'ADMIN'
                          ? 'border-[#C29367] bg-[#F9F5EE] shadow-sm ring-2 ring-[#C29367]/20'
                          : 'border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE]'
                      }`}
                      title="Select Admin Console"
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
                      onClick={() => handleSelectPortal('STAFF')}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all group ${
                        selectedRole === 'STAFF'
                          ? 'border-[#C29367] bg-[#F9F5EE] shadow-sm ring-2 ring-[#C29367]/20'
                          : 'border-[#EAE2D5] hover:border-[#C29367] hover:bg-[#F9F5EE]'
                      }`}
                      title="Select Employee Sales Rep Portal"
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
                    <input
                      type="text"
                      required
                      id="identifier"
                      placeholder={
                        selectedRole === 'CUSTOMER'
                          ? 'Email or phone'
                          : selectedRole === 'ADMIN'
                          ? 'Admin ID or official email'
                          : 'Employee ID or official email'
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                    />
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
                      onClick={() => {
                        setMode('signup');
                        setLoginError('');
                        setSignupError('');
                      }}
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
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] placeholder:text-[#747775] transition-all outline-none"
                    />
                  </div>

                  {forgotDispatched && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl text-[#2C2621] text-xs space-y-1 animate-in fade-in">
                      <div className="font-semibold flex items-center gap-1.5 text-[#9C6638]">
                        <Check className="w-4 h-4 text-[#9C6638]" />
                        Reset email sent!
                      </div>
                      <p className="text-[#5A5046] text-[11px]">
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
                {signupError && (
                  <div className="p-3.5 bg-[#fce8e6] border border-[#fad2cf] rounded-xl text-[#c5221f] text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#c5221f]" />
                    <span>{signupError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Contact name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] outline-none"
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
                      isEmailTaken ? 'border-[#c5221f] bg-[#fce8e6]/30' : 'border-[#747775] focus:border-[#C29367]'
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
                    type="password"
                    required
                    placeholder="Password (> 8 chars)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#747775] focus:border-[#C29367] focus:ring-2 focus:ring-[#C29367]/20 rounded-md text-sm text-[#1f1f1f] outline-none"
                  />

                  {/* Sleek, minimal single-line hint & dynamic indicator */}
                  <div className="mt-1.5 flex items-center justify-between text-[11px] px-1 text-[#444746]">
                    <span>Min. 8 characters with A-Z, a-z &amp; symbol</span>
                    {signupPassword.length > 0 && (
                      <span className={`font-semibold flex items-center gap-1 ${
                        valResult.isValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {valResult.isValid ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Strong
                          </>
                        ) : (
                          `${signupPassword.length}/8 chars`
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setSignupError('');
                    }}
                    className="text-sm font-medium text-[#444746] hover:bg-slate-100 px-3 py-2 rounded-full transition-colors"
                  >
                    Sign in instead
                  </button>

                  <button
                    type="submit"
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
