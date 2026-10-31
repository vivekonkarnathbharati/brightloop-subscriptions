'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { DiscountType, DiscountScope } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  Plus,
  ShieldAlert,
  Lock,
} from 'lucide-react';

export function DiscountsView() {
  const { discounts, products, isAdmin, createDiscountRule, toggleDiscountActive } = useBrightloop();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState(15);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(100);
  const [minQuantity] = useState(1);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [maxUsageLimit, setMaxUsageLimit] = useState(25);
  const [scope, setScope] = useState<DiscountScope>('WHOLE_SUBSCRIPTION');
  const [targetProductId, setTargetProductId] = useState('');

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    createDiscountRule({
      code: code.toUpperCase().trim(),
      description,
      type,
      value,
      minPurchaseAmount: minPurchaseAmount || undefined,
      minQuantity: minQuantity || undefined,
      startDate,
      endDate,
      maxUsageLimit,
      scope,
      targetProductId: scope === 'SPECIFIC_PRODUCT' ? targetProductId : undefined,
      isActive: true,
    });

    setIsModalOpen(false);
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={32} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Discount Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Admin Restricted
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Configurable percentage or fixed discounts with min purchase, expiry, and automated usage cutoff.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount Rule</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin-Only Action: Staff Cannot Add Discounts</span>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">RBAC Enforcement Active</div>
            <p className="text-amber-800 mt-0.5">
              You are signed in as Internal Staff. As defined in the hackathon rules, only an Admin can define discount rules or change usage caps. You can view existing discounts applied to customer quotes.
            </p>
          </div>
        </div>
      )}

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((rule) => {
          const isExpired = new Date(rule.endDate) < new Date();
          const isExhausted = rule.usageCount >= rule.maxUsageLimit;
          const isAvailable = rule.isActive && !isExpired && !isExhausted;

          return (
            <div
              key={rule.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isAvailable ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {rule.code}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isExhausted
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isExhausted ? 'Limit Reached' : isExpired ? 'Expired' : rule.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {rule.type === 'PERCENTAGE' ? `${rule.value}% OFF` : `-${formatCurrency(rule.value)} OFF`}
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{rule.description}</p>

                {/* Scope & Conditions */}
                <div className="space-y-2 text-xs p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scope:</span>
                    <span className="font-semibold text-slate-800">
                      {rule.scope === 'WHOLE_SUBSCRIPTION' ? 'Whole Subscription' : 'Specific Product'}
                    </span>
                  </div>
                  {rule.minPurchaseAmount && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min Purchase:</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(rule.minPurchaseAmount)}
                      </span>
                    </div>
                  )}
                  {rule.minQuantity && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min Seats:</span>
                      <span className="font-semibold text-slate-800">{rule.minQuantity} seats</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valid Range:</span>
                    <span className="font-medium text-slate-700">
                      {formatDate(rule.startDate)} &rarr; {formatDate(rule.endDate)}
                    </span>
                  </div>
                </div>

                {/* Usage meter */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Usage Counter:</span>
                    <span className="font-bold text-slate-800">
                      {rule.usageCount} / {rule.maxUsageLimit} used
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isExhausted ? 'bg-rose-500' : 'bg-indigo-600'
                      } rounded-full transition-all`}
                      style={{ width: `${Math.min(100, (rule.usageCount / rule.maxUsageLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Toggle switch for Admin */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Control</span>
                {isAdmin ? (
                  <button
                    onClick={() => toggleDiscountActive(rule.id)}
                    className={`font-semibold hover:underline ${
                      rule.isActive ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {rule.isActive ? 'Disable Rule' : 'Enable Rule'}
                  </button>
                ) : (
                  <span className="text-slate-400 italic">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Discount Program</h3>
                <p className="text-xs text-slate-500">Only Admin role can set pricing promotional discounts</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% off for first 100 enterprise subscribers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Value ({type === 'PERCENTAGE' ? '%' : '$'}) *</label>
                  <input
                    type="number"
                    min={1}
                    max={type === 'PERCENTAGE' ? 100 : 10000}
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Usages (Auto-stops) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={maxUsageLimit}
                    onChange={(e) => setMaxUsageLimit(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as DiscountScope)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  <option value="WHOLE_SUBSCRIPTION">Applies to Whole Subscription</option>
                  <option value="SPECIFIC_PRODUCT">Specific Product Only</option>
                </select>
              </div>

              {scope === 'SPECIFIC_PRODUCT' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Target Product</label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Create & Activate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
