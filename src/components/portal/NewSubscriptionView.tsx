'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentTerms, DiscountRule } from '@/lib/types';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Plus,
  Minus,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface NewSubscriptionViewProps {
  onComplete?: () => void;
}

export function NewSubscriptionView({ onComplete }: NewSubscriptionViewProps) {
  const {
    currentUser,
    plans,
    products,
    discounts,
    createSubscription,
    addNotification,
  } = useBrightloop();

  // Selected configurations
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    products[0]?.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('IMMEDIATE');

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountRule | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Active records
  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentVariant = currentProduct?.variants.find((v) => v.id === selectedVariantId);

  // Financial calculations
  const variantDelta = currentVariant ? currentVariant.priceDelta : 0;
  const unitPrice = (currentProduct ? currentProduct.salesPrice : 0) + variantDelta;
  const planBasePrice = currentPlan ? currentPlan.price : 0;
  const baseLineTotal = unitPrice * quantity;
  const rawSubtotal = planBasePrice + baseLineTotal;

  // Coupon validation & calculations
  const calculateDiscountAmount = (rule: DiscountRule | null, subtotal: number): number => {
    if (!rule) return 0;
    if (rule.type === 'PERCENTAGE') {
      return (subtotal * rule.value) / 100;
    }
    return Math.min(rule.value, subtotal);
  };

  const discountAmount = calculateDiscountAmount(appliedDiscount, rawSubtotal);
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const taxRate = 18; // 18% standard business software tax
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount;

  // Calculate renewal expiry date
  const computeExpiryDate = () => {
    const d = new Date();
    if (currentPlan?.frequency === 'YEARLY') {
      d.setFullYear(d.getFullYear() + 1);
    } else if (currentPlan?.frequency === 'WEEKLY') {
      d.setDate(d.getDate() + 7);
    } else if (currentPlan?.frequency === 'DAILY') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split('T')[0];
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const trimmed = couponCode.trim().toUpperCase();
    const match = discounts.find(
      (d) => d.code.toUpperCase() === trimmed && d.isActive
    );

    if (!match) {
      setCouponError(`Invalid or expired code "${trimmed}". Try WELCOME20 or BULK50OFF.`);
      setAppliedDiscount(null);
      return;
    }

    if (match.minPurchaseAmount && rawSubtotal < match.minPurchaseAmount) {
      setCouponError(
        `Code ${match.code} requires a minimum order of ${formatCurrency(match.minPurchaseAmount)}.`
      );
      setAppliedDiscount(null);
      return;
    }

    if (match.minQuantity && quantity < match.minQuantity) {
      setCouponError(`Code ${match.code} requires at least ${match.minQuantity} license seats.`);
      setAppliedDiscount(null);
      return;
    }

    setAppliedDiscount(match);
    const saving = calculateDiscountAmount(match, rawSubtotal);
    setCouponSuccess(`Coupon applied! You saved ${formatCurrency(saving)}.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Submit and create active subscription
  const handleConfirmSubscription = () => {
    if (!currentPlan || !currentProduct) return;
    setIsSubmitting(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = computeExpiryDate();

    // Create subscription object
    const created = createSubscription({
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      planId: currentPlan.id,
      planName: currentPlan.name,
      billingFrequency: currentPlan.frequency,
      status: 'ACTIVE',
      startDate: todayStr,
      expiryDate,
      paymentTerms,
      lines: [
        {
          id: `line-${Date.now()}`,
          productId: currentProduct.id,
          productName: currentProduct.name,
          variantId: currentVariant?.id,
          variantName: currentVariant?.name,
          variantDelta,
          quantity,
          unitPrice,
          taxRate,
          discountAmount,
          lineTotal: subtotalAfterDiscount,
        },
      ],
      subtotal: rawSubtotal,
      taxTotal: taxAmount,
      discountTotal: discountAmount,
      grandTotal,
      notes: `Self-service subscription order placed by ${currentUser.name} (${currentUser.email})${
        appliedDiscount ? ` with coupon ${appliedDiscount.code}` : ''
      }.`,
      isPaused: false,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    addNotification(`Subscription ${created.subscriptionNumber} activated successfully!`, 'success');

    // Return to portal after short visual confirmation
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2B231B] via-[#3A2E24] to-[#2B231B] text-[#FAF7F2] p-6 rounded-3xl shadow-xl border border-[#4A3B2E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur border border-white/10 shrink-0">
              <BrightloopLogo size={38} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#F5EDE1]/20 text-[#EFE7DC] border border-[#EFE7DC]/30 shadow-sm">
                  Subscription Catalog
                </span>
                <span className="text-xs text-[#C8BEB2]">Self-Service Enrollment</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Add New Subscription
              </h1>
              <p className="text-xs text-[#D5CBC0] mt-0.5">
                Enrolling for <span className="text-white font-medium">{currentUser.companyName || currentUser.name}</span> ({currentUser.email})
              </p>
            </div>
          </div>

          {onComplete && (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#D5CBC0] hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all self-start sm:self-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Subscriptions</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Configurator & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Plan, Product, and Terms Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Select Subscription Plan */}
          <div className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5EDE1] text-[#7A5B3D] text-xs font-bold flex items-center justify-center border border-[#E5D7C5]">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#2C2621]">Select Subscription Plan</h2>
              </div>
              <span className="text-xs text-[#7A6D61]">Recurring Cycle & Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C29367] bg-[#FFFDF9] ring-2 ring-[#C29367]/30 shadow-sm'
                        : 'border-[#EAE2D5] hover:border-[#D5C5B2] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#F5EDE1] text-[#7A5B3D] border border-[#E5D7C5]">
                          {plan.frequency}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#C29367] to-[#B88457] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#2C2621]">{plan.name}</h3>
                      <p className="text-xs text-[#7A6D61] mt-1 line-clamp-2">
                        {plan.description || 'Full-featured enterprise SaaS plan with SLA.'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#EAE2D5] flex items-baseline justify-between">
                      <span className="text-xs text-[#8C7E72]">Plan Base</span>
                      <div className="text-sm font-extrabold text-[#2C2621]">
                        {formatCurrency(plan.price)}
                        <span className="text-[10px] font-normal text-[#8C7E72]">
                          /{plan.frequency.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Configure Software & Variants */}
          <div className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5EDE1] text-[#7A5B3D] text-xs font-bold flex items-center justify-center border border-[#E5D7C5]">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#2C2621]">Configure Software Package & Variants</h2>
              </div>
              <span className="text-xs text-[#7A6D61]">Base Product & Addons</span>
            </div>

            {/* Product Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3D3126]">Primary Software Module</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const newProdId = e.target.value;
                  setSelectedProductId(newProdId);
                  const prod = products.find((p) => p.id === newProdId);
                  if (prod && prod.variants.length > 0) {
                    setSelectedVariantId(prod.variants[0].id);
                  } else {
                    setSelectedVariantId('');
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-[#EAE2D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C29367] text-[#2C2621]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.salesPrice)}) • {p.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Selector (if product has variants) */}
            {currentProduct && currentProduct.variants.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#3D3126]">
                    Select Variant / Integration
                  </label>
                  <span className="text-[11px] text-[#A36E43] font-medium">
                    Includes Odoo Connector (+ $560)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentProduct.variants.map((v) => {
                    const isSelectedVar = v.id === selectedVariantId;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelectedVar
                            ? 'border-[#C29367] bg-[#FFFDF9] font-bold text-[#2C2621] ring-1 ring-[#C29367]'
                            : 'border-[#EAE2D5] bg-[#FAF7F2] text-[#4D4238] hover:border-[#D5C5B2]'
                        }`}
                      >
                        <div>
                          <div>{v.name}</div>
                          <div className="text-[10px] text-[#8C7E72] font-normal">
                            {v.attributeName}: {v.attributeValue}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                            v.priceDelta > 0
                              ? 'bg-[#F7EFE6] text-[#8A5626] font-bold border border-[#E8DACB]'
                              : 'text-[#8C7E72]'
                          }`}
                        >
                          {v.priceDelta > 0 ? `+${formatCurrency(v.priceDelta)}` : 'Included'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-semibold text-[#3D3126]">License Seats / Instances</div>
                <div className="text-[11px] text-[#7A6D61]">User capacity allocated to this contract</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-[#EAE2D5] bg-[#FAF7F2] hover:bg-[#F0E6D8] text-[#2C2621] flex items-center justify-center transition-colors active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-bold text-[#2C2621] w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg border border-[#EAE2D5] bg-[#FAF7F2] hover:bg-[#F0E6D8] text-[#2C2621] flex items-center justify-center transition-colors active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Terms & Promotions */}
          <div className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5EDE1] text-[#7A5B3D] text-xs font-bold flex items-center justify-center border border-[#E5D7C5]">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#2C2621]">Payment Terms & Coupon Code</h2>
              </div>
              <span className="text-xs text-[#7A6D61]">Flexible Billing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Terms */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D3126]">Payment Settlement Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EAE2D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C29367] text-[#2C2621]"
                >
                  <option value="IMMEDIATE">Immediate (Card / Bank / UPI)</option>
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days (Standard Corporate)</option>
                  <option value="NET_60">Net 60 Days (Enterprise)</option>
                </select>
              </div>

              {/* Promo Coupon Form */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D3126]">Promo Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME20"
                    disabled={!!appliedDiscount}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-[#EAE2D5] bg-[#FAF7F2] uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C29367] text-[#2C2621] disabled:opacity-60"
                  />
                  {appliedDiscount ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 text-xs font-semibold bg-[#F2ECE4] hover:bg-[#EBE2D8] text-[#5A4D42] rounded-xl transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl shadow-sm shadow-[#C29367]/20 transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Instant Checkout */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <h3 className="text-sm font-bold text-[#2C2621]">Order Summary</h3>
              <span className="text-[11px] font-mono font-bold text-[#8A5626] bg-[#F7EFE6] px-2 py-0.5 rounded border border-[#E8DACB]">
                {currentPlan?.frequency}
              </span>
            </div>

            {/* Selected Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#2C2621]">{currentPlan?.name}</div>
                  <div className="text-[11px] text-[#7A6D61]">Base plan frequency subscription</div>
                </div>
                <div className="font-mono font-semibold text-[#2C2621]">
                  {formatCurrency(planBasePrice)}
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#2C2621]">
                    {quantity}x {currentProduct?.name}
                  </div>
                  {currentVariant && (
                    <div className="text-[11px] text-[#A36E43] font-normal">
                      {currentVariant.name}
                      {currentVariant.priceDelta > 0 && ` (+${formatCurrency(currentVariant.priceDelta)})`}
                    </div>
                  )}
                </div>
                <div className="font-mono font-semibold text-[#2C2621]">
                  {formatCurrency(baseLineTotal)}
                </div>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-semibold">Discount ({appliedDiscount.code})</span>
                  </div>
                  <span className="font-mono font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#EAE2D5] flex justify-between text-[#7A6D61]">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-[#2C2621]">
                  {formatCurrency(subtotalAfterDiscount)}
                </span>
              </div>

              <div className="flex justify-between text-[#7A6D61]">
                <span>Tax (GST / VAT @ 18%)</span>
                <span className="font-mono font-medium text-[#2C2621]">
                  {formatCurrency(taxAmount)}
                </span>
              </div>

              {/* Total Due */}
              <div className="pt-3 border-t-2 border-[#EAE2D5] flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-extrabold text-[#2C2621]">Grand Total</div>
                  <div className="text-[10px] text-[#8C7E72]">
                    Renews on {formatDate(computeExpiryDate())}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#9C6638]">
                  {formatCurrency(grandTotal)}
                </div>
              </div>
            </div>

            {/* Privileges & Guarantees */}
            <div className="p-3 bg-[#FAF7F2] border border-[#EFE7DC] rounded-xl space-y-2 text-[11px] text-[#5A4D42]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B88457] shrink-0" />
                <span>Zero Double-Billing & Tenant Isolation Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B88457] shrink-0" />
                <span>Pause, resume, or renew directly from self-service portal</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={handleConfirmSubscription}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white shadow-[#C29367]/25'
              }`}
            >
              {isSubmitting ? (
                <span>Activating Subscription...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscription Confirmed!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Activate Subscription</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
