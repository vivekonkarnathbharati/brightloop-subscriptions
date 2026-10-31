'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import {
  Settings,
  User,
  Building2,
  Shield,
  Bell,
  Key,
  Check,
  X,
  LogOut,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  Zap,
  Sliders,
  Crown,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, isCustomer, isAdmin, logout, runBillingDay, addNotification } = useBrightloop();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security'>('profile');

  // Admin / Customer Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [company, setCompany] = useState(
    currentUser?.companyName || (isAdmin ? 'Brightloop Platform HQ' : 'Acme Corporation')
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98201 12345');

  // Customer Preferences State
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Admin System Settings State
  const [doubleBillingGuard, setDoubleBillingGuard] = useState(true);
  const [autoBatchRun, setAutoBatchRun] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.name = name;
      currentUser.companyName = company;
      currentUser.phone = phone;
    }
    addNotification('Profile updated successfully!', 'success');
    onClose();
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    addNotification('Master security password updated!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    onClose();
  };

  const handleQuickBillingRun = () => {
    const res = runBillingDay();
    onClose();
  };

  const buttonTheme =
    'bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white shadow-md shadow-[#C29367]/20';

  return (
    <>
      {/* Invisible overlay for outside-click dismiss without screen blur */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Popover positioned over the sidebar right above the user card */}
      <div className="absolute bottom-16 left-2 right-2 z-50 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden flex flex-col text-xs text-[#2C2621] animate-in fade-in slide-in-from-bottom-2">
        {/* Header with Role Distinction */}
        <div className="p-3 bg-gradient-to-r from-[#2B231B] via-[#3A2E24] to-[#2B231B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C29367] to-[#B88457] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {isAdmin ? <Crown className="w-3.5 h-3.5" /> : currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="truncate">
              <div className="font-bold text-white text-xs truncate leading-tight flex items-center gap-1.5">
                {currentUser.name}
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#B88457] text-white uppercase">
                  {isAdmin ? 'ROOT ADMIN' : 'CUSTOMER'}
                </span>
              </div>
              <div className="text-[10px] text-[#C8BEB2] truncate leading-tight">{currentUser.email}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D5CBC0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switch Pills */}
        <div className="flex border-b border-[#EAE2D5] bg-[#F5EDE1] p-1 gap-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all ${
              activeTab === 'profile'
                ? 'bg-[#B88457] text-white shadow-sm'
                : 'text-[#6D5E51] hover:bg-[#EBE1D4]'
            }`}
          >
            {isAdmin ? 'Authority' : 'Profile'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all ${
              activeTab === 'system'
                ? 'bg-[#B88457] text-white shadow-sm'
                : 'text-[#6D5E51] hover:bg-[#EBE1D4]'
            }`}
          >
            {isAdmin ? 'Platform Engine' : 'Billing Prefs'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all ${
              activeTab === 'security'
                ? 'bg-[#B88457] text-white shadow-sm'
                : 'text-[#6D5E51] hover:bg-[#EBE1D4]'
            }`}
          >
            Security
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 max-h-[300px] overflow-y-auto space-y-2.5">
          {/* TAB 1: Profile / Admin Authority */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#6D5E51] mb-0.5">
                  {isAdmin ? 'Administrator Name' : 'Contact Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#EAE2D5] rounded-lg bg-white focus:border-[#C29367] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6D5E51] mb-0.5">
                  {isAdmin ? 'Enterprise Entity / Merchant HQ' : 'Company / Organization'}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#EAE2D5] rounded-lg bg-white focus:border-[#C29367] outline-none text-xs"
                />
              </div>

              {isAdmin ? (
                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EAE2D5] space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6D5E51]">Authority Level:</span>
                    <span className="font-bold text-[#7A4B20] bg-[#F3EBE0] px-1.5 py-0.5 rounded text-[10px]">
                      Root Superadmin (Boss)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6D5E51]">Access Privileges:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[10px]">
                      <BadgeCheck className="w-3.5 h-3.5" /> Full Read/Write All Modules
                    </span>
                  </div>
                  <div className="text-[10px] text-[#7A6D61] pt-1 border-t border-[#EAE2D5]">
                    Authorized to invite/remove staff, manage pricing, enforce statutory tax rules, and trigger billing runs.
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-white rounded-xl border border-[#EAE2D5] space-y-1 text-[11px]">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#6D5E51]">GSTIN:</span>
                    <span className="font-bold text-[#2C2621]">07AAAAA0000A1Z5</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold text-[10px]">
                    <span>Status:</span>
                    <span>✓ 18% GST Verified</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-1.5 rounded-lg text-xs font-semibold ${buttonTheme} transition-all mt-1`}
              >
                Save Details
              </button>
            </form>
          )}

          {/* TAB 2: System Engine (Admin) or Billing Preferences (Customer) */}
          {activeTab === 'system' && (
            <div className="space-y-2.5 text-xs">
              {isAdmin ? (
                /* ADMIN SYSTEM CONTROLS (Boss Level Authority) */
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE2D5] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-[#2C2621]">Zero Double-Billing Guard</div>
                        <div className="text-[10px] text-[#7A6D61]">Enforce strict deduplication per cycle</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ENFORCED
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#EAE2D5]/70 pt-2">
                      <div>
                        <div className="font-semibold text-xs text-[#2C2621]">Platform Currency</div>
                        <div className="text-[10px] text-[#7A6D61]">Global display currency</div>
                      </div>
                      <div className="flex rounded-md border border-[#EAE2D5] overflow-hidden text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setCurrency('USD')}
                          className={`px-2 py-1 ${currency === 'USD' ? 'bg-[#B88457] text-white' : 'bg-[#FAF7F2] text-[#7A6D61]'}`}
                        >
                          USD ($)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency('INR')}
                          className={`px-2 py-1 ${currency === 'INR' ? 'bg-[#B88457] text-white' : 'bg-[#FAF7F2] text-[#7A6D61]'}`}
                        >
                          INR (₹)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Boss Quick Billing Run Trigger */}
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#E9DAC8] space-y-1.5">
                    <div className="font-semibold text-xs text-[#7A4B20] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#B88457] fill-current" />
                      Global Billing Engine Trigger
                    </div>
                    <div className="text-[10px] text-[#7A6D61]">
                      Execute automated batch billing run across all active subscription contracts right now.
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickBillingRun}
                      className="w-full py-1.5 bg-[#B88457] hover:bg-[#A76D3B] text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      Run Batch Cycle Now
                    </button>
                  </div>
                </div>
              ) : (
                /* CUSTOMER BILLING PREFERENCES */
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE2D5] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-[#2C2621]">Email Invoices</div>
                        <div className="text-[10px] text-[#7A6D61]">Auto-dispatch PDF receipts</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailInvoices(!emailInvoices)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          emailInvoices ? 'bg-[#B88457]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform absolute top-0.5 ${
                            emailInvoices ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#EAE2D5]/70 pt-2">
                      <div>
                        <div className="font-semibold text-xs text-[#2C2621]">Renewal Alerts</div>
                        <div className="text-[10px] text-[#7A6D61]">7 days before expiry</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRenewalAlerts(!renewalAlerts)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          renewalAlerts ? 'bg-[#B88457]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform absolute top-0.5 ${
                            renewalAlerts ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addNotification('Customer preferences updated!', 'success');
                      onClose();
                    }}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold ${buttonTheme} transition-all`}
                  >
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Security */}
          {activeTab === 'security' && (
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-[#EAE2D5] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#7A6D61]">Clearance:</span>
                  <span className="font-semibold text-[#2C2621]">
                    {isAdmin ? 'System Root Master' : 'Tenant Sandbox (Isolated)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6D61]">Encryption:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    TLS 1.3 Active
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="bg-white p-2.5 rounded-xl border border-[#EAE2D5] space-y-1.5">
                <div className="font-semibold text-[11px] text-[#2C2621]">
                  {isAdmin ? 'Update Superuser Passkey' : 'Update Password'}
                </div>
                <input
                  type="password"
                  required
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-2 py-1 border border-[#EAE2D5] rounded-md text-xs outline-none"
                />
                <input
                  type="password"
                  required
                  placeholder="New password (8+ chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-2 py-1 border border-[#EAE2D5] rounded-md text-xs outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1 rounded-md text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F5EDE1] text-[#7A4B20] border border-[#EAE2D5] transition-all"
                >
                  Save Passkey
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-2 bg-[#F5EDE1] border-t border-[#EAE2D5]">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
