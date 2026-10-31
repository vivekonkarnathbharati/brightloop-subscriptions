'use client';

import React, { useState, useRef } from 'react';
import { useBrightloop } from '@/lib/store';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { formatCurrency, formatDate, isInvoiceOverdue } from '@/lib/utils';
import {
  Receipt,
  Repeat,
  CheckCircle,
  Play,
  Pause,
  RotateCw,
  Sparkles,
  Plus,
  Calendar,
  LayoutGrid,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NewSubscriptionView } from './NewSubscriptionView';

interface CustomerPortalViewProps {
  onPayInvoice?: (invoiceId: string) => void;
  initialTab?: 'subs' | 'invoices' | 'new_subscription';
  onNavigateToNewSub?: () => void;
}

export function CustomerPortalView({
  onPayInvoice,
  initialTab = 'subs',
  onNavigateToNewSub,
}: CustomerPortalViewProps) {
  const {
    currentUser,
    subscriptions,
    invoices,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
  } = useBrightloop();

  const [activeTab, setActiveTab] = useState<'subs' | 'invoices' | 'new_subscription'>(initialTab);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'slider'>('grid');
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollStep = 410;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollStep : scrollStep,
        behavior: 'smooth',
      });
    }
  };

  // Strict tenant scoping: Customer can ONLY see their own subscriptions and invoices!
  const mySubscriptions = subscriptions.filter(
    (s) =>
      s.customerId === currentUser.id ||
      s.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const myInvoices = invoices.filter(
    (i) =>
      i.customerId === currentUser.id ||
      i.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Dedicated New Subscription Enrollment View (Clean single header banner, no duplicate stacked banners)
  if (activeTab === 'new_subscription') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <NewSubscriptionView onComplete={() => setActiveTab('subs')} />
      </div>
    );
  }

  // Common Subscription Card Renderer for both Grid and Slider views
  const renderSubscriptionCard = (sub: (typeof subscriptions)[0]) => (
    <div className="w-full h-full bg-white rounded-2xl border border-[#EAE2D5] hover:border-[#C29367] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Top Row: Code & Status Badges */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
          <span className="font-mono text-xs font-bold text-[#8A5626] bg-[#F7EFE6] px-2.5 py-1 rounded-lg border border-[#E8DACB]">
            {sub.subscriptionNumber}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                sub.status === 'ACTIVE'
                  ? 'bg-[#EFE5D7] text-[#634931] border border-[#DDD0BF]'
                  : sub.status === 'QUOTATION'
                  ? 'bg-[#F5EDE1] text-[#7A5B3D] border border-[#E5D7C5]'
                  : 'bg-[#F2ECE4] text-[#6E6155]'
              }`}
            >
              {sub.isPaused ? 'PAUSED' : sub.status}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#F5EDE1] text-[#7A5B3D] border border-[#E5D7C5]">
              {sub.billingFrequency}
            </span>
          </div>
        </div>

        {/* Plan Name */}
        <div>
          <h3 className="text-lg font-bold text-[#2C2621]">{sub.planName}</h3>
          {sub.notes && (
            <p className="text-xs text-[#7A6D61] mt-0.5 line-clamp-2">{sub.notes}</p>
          )}
        </div>

        {/* Big Price Box */}
        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EFE7DC] flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C7E72]">
              Recurring Bill
            </div>
            <div className="text-[11px] text-[#7A6D61] mt-0.5">
              {sub.paymentTerms ? sub.paymentTerms.replace('_', ' ') : 'Immediate'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#9C6638] font-mono leading-none">
              {formatCurrency(sub.grandTotal)}
            </div>
            <span className="text-[10px] text-[#8C7E72] font-medium">
              /{sub.billingFrequency.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Timeline / Dates */}
        <div className="flex items-center justify-between text-xs text-[#7A6D61] px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#B88457]" />
            <span>
              Renews: <span className="font-bold text-[#2C2621]">{formatDate(sub.expiryDate)}</span>
            </span>
          </div>
          <span className="text-[11px]">
            Started {formatDate(sub.startDate)}
          </span>
        </div>

        {/* Software Lines List */}
        <div className="p-3 bg-[#FAF7F2] border border-[#EFE7DC] rounded-xl space-y-2 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E72] mb-1">
            Licensed Modules:
          </div>
          {sub.lines.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-start py-1 border-b border-[#EAE2D5]/70 last:border-0 last:pb-0"
            >
              <div className="pr-2">
                <span className="font-semibold text-[#2C2621]">
                  {l.quantity}x {l.productName}
                </span>
                {l.variantName && (
                  <span className="block text-[10px] font-bold text-[#8A5626] mt-0.5">
                    {l.variantName}
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-[#2C2621] shrink-0">
                {formatCurrency(l.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Mini Cost Breakdown */}
        <div className="space-y-1 text-xs px-1 text-[#7A6D61]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-[#2C2621]">{formatCurrency(sub.subtotal)}</span>
          </div>
          {sub.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discount</span>
              <span className="font-mono">-{formatCurrency(sub.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax (18%)</span>
            <span className="font-mono text-[#2C2621]">{formatCurrency(sub.taxTotal)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-3 border-t border-[#EAE2D5] flex gap-2">
        {sub.isPaused ? (
          <button
            onClick={() => resumeSubscription(sub.id)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-[#C29367]/25 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={() => pauseSubscription(sub.id)}
            className="flex-1 px-3 py-2 bg-[#F2ECE4] hover:bg-[#EBE2D8] text-[#5A4D42] rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors active:scale-95"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={() => renewSubscription(sub.id)}
          className="flex-1 px-3 py-2 bg-[#F5EDE1] hover:bg-[#EFE5D7] text-[#7A4B20] border border-[#E5D7C5] rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Renew</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-[#2B231B] via-[#3A2E24] to-[#2B231B] text-[#FAF7F2] p-6 rounded-3xl shadow-xl border border-[#4A3B2E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur border border-white/10 shrink-0">
              <BrightloopLogo size={38} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#F5EDE1]/20 text-[#EFE7DC] border border-[#EFE7DC]/30 shadow-sm">
                  Customer Self-Service Portal
                </span>
                <span className="text-xs text-[#C8BEB2]">Tenant-Isolated Access</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.companyName || currentUser.name}</h1>
              <p className="text-xs text-[#D5CBC0] mt-0.5">
                Account contact: <span className="text-white font-medium">{currentUser.name}</span> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-right">
              <div className="text-xs text-[#C8BEB2]">Active Contracts</div>
              <div className="text-xl font-bold text-white">
                {mySubscriptions.filter((s) => s.status === 'ACTIVE').length}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-right">
              <div className="text-xs text-[#C8BEB2]">Pending Dues</div>
              <div className="text-xl font-bold text-[#DDB892]">
                {formatCurrency(myInvoices.reduce((acc, i) => acc + i.amountDue, 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab switcher & Action button */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('subs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'subs'
                  ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-md shadow-[#C29367]/25'
                  : 'text-[#D5CBC0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>My Subscriptions ({mySubscriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-md shadow-[#C29367]/25'
                  : 'text-[#D5CBC0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>My Invoices & Receipts ({myInvoices.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* View 1: My Subscriptions */}
      {activeTab === 'subs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#2C2621]">Your Subscription Contracts</h2>
              <span className="text-xs text-[#7A6D61]">Self-service pause, resume, and renewal controls</span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Dual View Option: Grid (4 in view, scroll vertically) vs Slide View */}
              <div className="flex items-center p-0.5 bg-white rounded-xl border border-[#EAE2D5] shadow-sm text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    layoutMode === 'grid'
                      ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-sm'
                      : 'text-[#6D5E51] hover:text-[#2C2621] hover:bg-[#F0E6D8]'
                  }`}
                  title="Grid View (4 in view, vertical scroll)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('slider')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    layoutMode === 'slider'
                      ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-sm'
                      : 'text-[#6D5E51] hover:text-[#2C2621] hover:bg-[#F0E6D8]'
                  }`}
                  title="Slide View (Horizontal carousel slider)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Slider</span>
                </button>
              </div>

              {/* Slider Arrow Controls when Slide View is selected */}
              {layoutMode === 'slider' && mySubscriptions.length > 1 && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE2D5] shadow-sm">
                  <button
                    onClick={() => scrollSlider('left')}
                    className="p-1.5 rounded-lg hover:bg-[#F0E6D8] text-[#5A4D42] transition-colors active:scale-95"
                    title="Slide left"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#8C7E72] px-1">
                    Slider
                  </span>
                  <button
                    onClick={() => scrollSlider('right')}
                    className="p-1.5 rounded-lg hover:bg-[#F0E6D8] text-[#5A4D42] transition-colors active:scale-95"
                    title="Slide right"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => (onNavigateToNewSub ? onNavigateToNewSub() : setActiveTab('new_subscription'))}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#C29367]/20 transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Subscription</span>
              </button>
            </div>
          </div>

          {mySubscriptions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-[#EAE2D5] space-y-3">
              <p className="text-sm font-semibold text-[#2C2621]">No active subscriptions found for this account.</p>
              <p className="text-xs text-[#7A6D61]">
                Browse our plans and activate a new subscription online in seconds.
              </p>
              <button
                onClick={() => setActiveTab('new_subscription')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Your First Subscription</span>
              </button>
            </div>
          ) : layoutMode === 'slider' ? (
            /* SLIDE VIEW: Horizontal Carousel with Left/Right Controls */
            <div className="relative w-full overflow-hidden">
              <div
                ref={sliderRef}
                className="flex flex-row gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-5 contracts-slider"
              >
                {mySubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 snap-start"
                  >
                    {renderSubscriptionCard(sub)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* GRID VIEW: 2x2 Clean Layout with Natural Vertical Scroll */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
              {mySubscriptions.map((sub) => (
                <div key={sub.id} className="w-full">
                  {renderSubscriptionCard(sub)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: My Invoices & Receipts */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Invoices & Billing Statements</h2>
            <span className="text-xs text-slate-500">Pay online via UPI, Credit Card, or Bank Wire</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No invoices currently issued for your account.
                    </td>
                  </tr>
                ) : (
                  myInvoices.map((inv) => {
                    const overdue = isInvoiceOverdue(inv);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(inv.billingPeriodStart)} - {formatDate(inv.billingPeriodEnd)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                            {formatDate(inv.dueDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : overdue
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {overdue ? 'OVERDUE' : inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</div>
                          {inv.amountDue > 0 && (
                            <div className="text-[10px] text-rose-600 font-semibold">
                              Due: {formatCurrency(inv.amountDue)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (onPayInvoice) onPayInvoice(inv.id);
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-lg text-xs font-bold shadow-sm shadow-[#C29367]/25 active:scale-95 transition-all"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
