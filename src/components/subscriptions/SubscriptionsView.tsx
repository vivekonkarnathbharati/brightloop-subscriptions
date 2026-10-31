'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { Subscription, SubscriptionStatus, PaymentTerms } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  Plus,
  Search,
  Play,
  Pause,
  RotateCw,
  XCircle,
  FileCheck,
  Send,
  Zap,
} from 'lucide-react';

export function SubscriptionsView() {
  const {
    subscriptions,
    plans,
    products,
    quotationTemplates,
    createSubscription,
    updateSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscription,
    generateInvoiceForSubscription,
  } = useBrightloop();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for new quote / subscription
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_15');
  const [initialStatus, setInitialStatus] = useState<SubscriptionStatus>('QUOTATION');

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // When template is selected, auto-populate
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = quotationTemplates.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedPlanId(tmpl.planId);
      if (tmpl.lines.length > 0) {
        setSelectedProductId(tmpl.lines[0].productId);
        setSelectedVariantId(tmpl.lines[0].variantId || '');
        setQuantity(tmpl.lines[0].quantity);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    const chosenPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    const chosenProduct = products.find((p) => p.id === selectedProductId) || products[0];
    const chosenVariant = chosenProduct.variants.find((v) => v.id === selectedVariantId);

    const variantDelta = chosenVariant ? chosenVariant.priceDelta : 0;
    const unitPrice = chosenProduct.salesPrice + variantDelta;
    const lineTotal = unitPrice * quantity;
    const taxRate = 18;
    const taxAmount = (lineTotal * taxRate) / 100;
    const grandTotal = lineTotal + taxAmount;

    const startDate = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    if (chosenPlan.frequency === 'YEARLY') expDate.setFullYear(expDate.getFullYear() + 1);
    else expDate.setMonth(expDate.getMonth() + 1);

    createSubscription({
      customerId: `cust-${Date.now()}`,
      customerName,
      customerEmail,
      planId: chosenPlan.id,
      planName: chosenPlan.name,
      billingFrequency: chosenPlan.frequency,
      status: initialStatus,
      startDate,
      expiryDate: expDate.toISOString().split('T')[0],
      paymentTerms,
      lines: [
        {
          id: `line-${Date.now()}`,
          productId: chosenProduct.id,
          productName: chosenProduct.name,
          variantId: chosenVariant?.id,
          variantName: chosenVariant?.name,
          variantDelta,
          quantity,
          unitPrice,
          taxRate,
          discountAmount: 0,
          lineTotal,
        },
      ],
      subtotal: lineTotal,
      taxTotal: taxAmount,
      discountTotal: 0,
      grandTotal,
      notes: selectedTemplateId ? `Created from quotation template.` : 'Created directly.',
      isPaused: false,
    });

    setIsCreateModalOpen(false);
    // Reset form
    setCustomerName('');
    setCustomerEmail('');
    setSelectedTemplateId('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={34} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Subscriptions & Quotations
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Contract Operations
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Lifecycle pipeline: <span className="font-semibold text-[#2C2621]">Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote / Subscription</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SUB#, customer, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>

        {/* State filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          {['ALL', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all text-xs whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan & Cycle</th>
                <th className="py-3 px-4">Status & Health</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No subscriptions found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Number */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="hover:text-sky-600 hover:underline flex items-center gap-1.5"
                      >
                        {sub.subscriptionNumber}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600">
                        {sub.billingFrequency}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'QUOTATION'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : sub.status === 'CLOSED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                        {sub.isPaused && (
                          <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-amber-500 text-white">
                            PAUSED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{formatCurrency(sub.grandTotal)}</div>
                      <div className="text-[10px] text-slate-400">Taxes included</div>
                    </td>

                    {/* Expiry */}
                    <td className="py-3 px-4 text-slate-600">{formatDate(sub.expiryDate)}</td>

                    {/* State Machine Transition Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Draft -> Send Quote */}
                        {sub.status === 'DRAFT' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'QUOTATION')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                            title="Transition: Draft -> Quotation"
                          >
                            <Send className="w-3 h-3" />
                            Send Quote
                          </button>
                        )}

                        {/* Quotation -> Confirm */}
                        {sub.status === 'QUOTATION' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                            title="Customer accepts quote: Transition -> Confirmed"
                          >
                            <FileCheck className="w-3 h-3" />
                            Confirm Quote
                          </button>
                        )}

                        {/* Confirmed -> Activate */}
                        {sub.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'ACTIVE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                            title="Activate subscription and start recurring billing"
                          >
                            <Play className="w-3 h-3" />
                            Activate
                          </button>
                        )}

                        {/* Active Controls */}
                        {sub.status === 'ACTIVE' && (
                          <>
                            {/* Bill Now Trigger */}
                            <button
                              onClick={() => generateInvoiceForSubscription(sub.id)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg"
                              title="Generate this cycle's invoice (Zero Double-Billing)"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>

                            {/* Pause / Resume */}
                            {sub.isPaused ? (
                              <button
                                onClick={() => resumeSubscription(sub.id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                                title="Resume Subscription"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => pauseSubscription(sub.id)}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg"
                                title="Pause Subscription"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Renew */}
                            <button
                              onClick={() => renewSubscription(sub.id)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"
                              title="Extend & Renew"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Close */}
                            <button
                              onClick={() => closeSubscription(sub.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg"
                              title="Terminate & Close"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Details Modal Trigger */}
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900">
                    {selectedSub.subscriptionNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                      selectedSub.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedSub.status === 'QUOTATION'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedSub.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedSub.status === 'CLOSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedSub.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSub.customerName}</p>
              </div>

              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times; Close
              </button>
            </div>

            {/* Stepper showing state progress */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Lifecycle Progression
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                {['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'].map((step, idx) => {
                  const states = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];
                  const currentIdx = states.indexOf(selectedSub.status);
                  const isPast = idx <= currentIdx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPast ? 'bg-gradient-to-r from-[#C29367] to-[#B88457] text-white shadow-sm shadow-[#C29367]/20' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-semibold ${isPast ? 'text-[#362A1F]' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Contract Line Items & Variants
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold text-[10px]">
                    <tr>
                      <th className="p-2.5">Product & Variant</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Unit Price</th>
                      <th className="p-2.5">Tax</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSub.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2.5 font-medium text-slate-900">
                          <div>{l.productName}</div>
                          {l.variantName && (
                            <div className="text-[11px] text-blue-600 font-medium">
                              {l.variantName}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5">{l.quantity}</td>
                        <td className="p-2.5">{formatCurrency(l.unitPrice)}</td>
                        <td className="p-2.5">{l.taxRate}%</td>
                        <td className="p-2.5 text-right font-semibold">{formatCurrency(l.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedSub.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes:</span>
                <span>{formatCurrency(selectedSub.taxTotal)}</span>
              </div>
              {selectedSub.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discounts Applied:</span>
                  <span>-{formatCurrency(selectedSub.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Grand Total ({selectedSub.billingFrequency}):</span>
                <span>{formatCurrency(selectedSub.grandTotal)}</span>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Close View
              </button>
              {selectedSub.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    generateInvoiceForSubscription(selectedSub.id);
                    setSelectedSub(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-sky-500/20 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Generate Invoice Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Quote / Subscription Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <BrightloopLogo size={28} palette="sales" showWordmark={false} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Quotation / Subscription</h3>
                  <p className="text-xs text-slate-500">
                    Sales rep workflow: Start from template or customize product & variants.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Optional: Start from Quotation Template */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start From Quotation Template (Optional)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Custom Quote from Scratch --</option>
                  {quotationTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Valid {t.validityDays} days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Retail Inc"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@company.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Plan & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subscription Plan *</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.frequency} - ${p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="IMMEDIATE">Due Immediately</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                  </select>
                </div>
              </div>

              {/* Product and Variant */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-semibold text-slate-800">Primary Product & Variant Selection</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setSelectedVariantId('');
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.salesPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">
                      Variant (e.g. Odoo Brand +560)
                    </label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="">No Variant / Base Price</option>
                      {products
                        .find((p) => p.id === selectedProductId)
                        ?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} (+${v.priceDelta})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-slate-600">Quantity:</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 p-1.5 border border-slate-200 rounded-lg text-center"
                    />
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500">Live Calculated Line: </span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(
                        ((products.find((p) => p.id === selectedProductId)?.salesPrice || 0) +
                          (products
                            .find((p) => p.id === selectedProductId)
                            ?.variants.find((v) => v.id === selectedVariantId)?.priceDelta || 0)) *
                          quantity
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Initial Lifecycle State */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial State</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialStatus('DRAFT')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      initialStatus === 'DRAFT'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStatus('QUOTATION')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      initialStatus === 'QUOTATION'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStatus('CONFIRMED')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      initialStatus === 'CONFIRMED'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Confirmed
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/25 active:scale-95 transition-all"
                >
                  Generate Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
