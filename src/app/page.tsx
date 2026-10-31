'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Repeat,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronRight,
  Zap,
  Building,
  Briefcase,
  UserCheck,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  ShoppingCart,
  PauseCircle,
  PlayCircle,
  XCircle,
  CreditCard,
  PlusCircle,
  Tag,
  Percent,
  Check,
  Eye,
  Users,
  Smartphone,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import SmartRevenueWaterfall from '@/components/SmartRevenueWaterfall';
import CustomerRiskRadar from '@/components/CustomerRiskRadar';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 3 Primary Portals State: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  const [activePortalView, setActivePortalView] = useState<'CUSTOMER' | 'ADMIN' | 'STAFF'>('CUSTOMER');

  // Customer Portal Data
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSubs, setCustomerSubs] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);

  // Master Data
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Customer Buy Subscription Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyPlanId, setBuyPlanId] = useState('');
  const [buyProductId, setBuyProductId] = useState('');
  const [buyVariantId, setBuyVariantId] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buySubmitting, setBuySubmitting] = useState(false);

  // Billing Day action state
  const [isBillingRunLoading, setIsBillingRunLoading] = useState(false);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/customers').then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([dashData, custList, planList, prodList]) => {
        setStats(dashData);
        if (Array.isArray(custList) && custList.length > 0) {
          setCustomers(custList);
          const savedCustId = typeof window !== 'undefined' ? localStorage.getItem('brightloop_customer_id') : null;
          const initialId = savedCustId && custList.some((c: any) => c.id === savedCustId) ? savedCustId : custList[0].id;
          setSelectedCustomerId(initialId);
        }
        if (Array.isArray(planList) && planList.length > 0) {
          setPlans(planList);
          setBuyPlanId(planList[0].id);
        }
        if (Array.isArray(prodList) && prodList.length > 0) {
          setProducts(prodList);
          setBuyProductId(prodList[0].id);
          if (prodList[0].variants && prodList[0].variants.length > 0) {
            setBuyVariantId(prodList[0].variants[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error initializing portals:', err);
        setLoading(false);
      });
  }, []);

  // Fetch subscriptions and invoices for currently selected customer
  const loadSelectedCustomerData = (custId: string) => {
    if (!custId) return;
    Promise.all([
      fetch(`/api/subscriptions?customerId=${custId}`).then((r) => r.json()),
      fetch(`/api/invoices?customerId=${custId}`).then((r) => r.json()),
    ]).then(([subData, invData]) => {
      setCustomerSubs(Array.isArray(subData) ? subData : []);
      setCustomerInvoices(Array.isArray(invData) ? invData : []);
    });
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadSelectedCustomerData(selectedCustomerId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('brightloop_customer_id', selectedCustomerId);
      }
    }
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Action: Customer Buys Subscription -> Sub becomes ACTIVE immediately!
  const handlePurchaseSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !buyPlanId || !buyProductId) {
      alert('Please select a customer, plan, and product');
      return;
    }
    setBuySubmitting(true);

    try {
      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: buyPlanId,
          paymentTerms: 'Immediate',
          status: 'ACTIVE', // Automatically Active on purchase!
          notes: 'Purchased directly via Customer App Portal',
          lines: [
            {
              productId: buyProductId,
              variantId: buyVariantId || null,
              quantity: Number(buyQuantity) || 1,
            },
          ],
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok) {
        throw new Error(subData.error || 'Failed to create subscription');
      }

      // Generate invoice immediately
      try {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: subData.id }),
        });
      } catch (err) {
        console.warn('Auto invoice notice:', err);
      }

      alert(
        `🎉 Subscription ${subData.subscriptionNumber} is now ACTIVE! Your invoice has been generated automatically.`
      );
      setShowBuyModal(false);
      loadSelectedCustomerData(selectedCustomerId);
    } catch (err: any) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setBuySubmitting(false);
    }
  };

  // Action: Pause / Resume / Cancel subscription
  const handleUpdateSubscriptionStatus = async (subscriptionId: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subscriptionId, status: nextStatus }),
      });
      if (res.ok) {
        loadSelectedCustomerData(selectedCustomerId);
      } else {
        alert('Could not update status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  // Action: Admin Run Billing Day Batch
  const handleRunBillingDay = async () => {
    try {
      setIsBillingRunLoading(true);
      const res = await fetch('/api/billing-run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBillingNotice(`⚡ ${data.message}`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(data.error || 'Failed to run billing day');
      }
    } catch (e) {
      alert('Error triggering billing run');
    } finally {
      setIsBillingRunLoading(false);
    }
  };

  // Calculation for live purchase preview
  const currentSelectedProduct = products.find((p) => p.id === buyProductId);
  const currentSelectedVariant = currentSelectedProduct?.variants?.find((v: any) => v.id === buyVariantId);
  const currentSelectedPlan = plans.find((p) => p.id === buyPlanId);

  const basePrice = (currentSelectedProduct?.salesPrice || 0) + (currentSelectedVariant?.priceAdjustment || 0);
  const previewSubtotal = basePrice * (Number(buyQuantity) || 1);
  const previewTax = (previewSubtotal * 18) / 100;
  const previewTotal = previewSubtotal + previewTax;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading Brightloop Unified Mobile ERP Portals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. FIRST INTERFACE: 3-PORTAL MOBILE APP BAR (CUSTOMER / ADMIN / STAFF)   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-24 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Brightloop Multi-Portal System
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                Mobile-App View
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select one of the three primary sections below to view the dedicated workspace:
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Interactive App Viewport</span>
          </div>
        </div>

        {/* 3-Section Segmented Mobile Control */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mt-5 relative z-10">
          <button
            onClick={() => setActivePortalView('CUSTOMER')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition ${
              activePortalView === 'CUSTOMER'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Customer Portal</span>
          </button>

          <button
            onClick={() => setActivePortalView('ADMIN')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition ${
              activePortalView === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Admin Section</span>
          </button>

          <button
            onClick={() => setActivePortalView('STAFF')}
            className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition ${
              activePortalView === 'STAFF'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Internal Staff</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: CUSTOMER PORTAL (Buy, Active Subs, Pause, Cancel, Pay)     */}
      {/* ========================================================================= */}
      {activePortalView === 'CUSTOMER' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Customer Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Authenticated Customer Profile
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedCustomer?.companyName || selectedCustomer?.name}
                </div>
                <div className="text-[11px] text-slate-400">{selectedCustomer?.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Customer ID:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                {customers.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    CUST-{String(i + 1).padStart(3, '0')}: {c.companyName || c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowBuyModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/30 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buy Subscription</span>
              </button>
            </div>
          </div>

          {/* Customer Subscriptions Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-purple-400" />
                  My Subscriptions ({customerSubs.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View, pause, resume, or cancel your recurring software plans.
                </p>
              </div>

              <Link
                href={`/portal?customerId=${selectedCustomerId}`}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Open Full Dedicated Portal <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {customerSubs.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Repeat className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white">No Active Subscriptions</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button below to purchase a subscription plan and activate it immediately.
                </p>
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg"
                >
                  Buy & Activate Subscription Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerSubs.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-purple-300">
                          {s.subscriptionNumber}
                        </span>
                        <div className="text-sm font-bold text-white mt-0.5">{s.plan?.name}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : s.status === 'PAUSED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      {s.lines?.map((l: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            • {l.product?.name}{' '}
                            {l.variant && (
                              <span className="text-purple-300 font-mono">
                                [{l.variant.variantName || l.variant.name}]
                              </span>
                            )}
                            <span className="text-slate-500 ml-1">x{l.quantity}</span>
                          </span>
                          <span className="font-mono text-slate-200">${l.totalAmount?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Action Buttons: Pause, Resume, Cancel */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">Controls:</span>
                      <div className="flex items-center gap-1.5">
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateSubscriptionStatus(s.id, 'PAUSED')}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1"
                          >
                            <PauseCircle className="w-3 h-3" />
                            Pause
                          </button>
                        )}

                        {s.status === 'PAUSED' && (
                          <button
                            onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Resume
                          </button>
                        )}

                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              if (confirm('Cancel this subscription?')) {
                                handleUpdateSubscriptionStatus(s.id, 'CLOSED');
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Cancel
                          </button>
                        )}

                        {s.status === 'CLOSED' && (
                          <button
                            onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          >
                            Renew
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION 2: ADMIN SECTION (Products, Variants +$560, Plans, Discounts)  */}
      {/* ========================================================================= */}
      {activePortalView === 'ADMIN' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Admin Header Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Admin System Governance Console
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Admin sets up products, plans, variants (+$560 Odoo), taxes, and discount caps. Only admin can add staff.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunBillingDay}
                disabled={isBillingRunLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isBillingRunLoading ? 'Running...' : 'Run Billing Day Batch'}</span>
              </button>
              <Link
                href="/products"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
              >
                Manage Catalog
              </Link>
            </div>
          </div>

          {billingNotice && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{billingNotice}</span>
            </div>
          )}

          {/* Admin Configuration Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Products & Variants
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Core Software, Add-ons, and brand variants like <strong>Odoo Enterprise (+$560)</strong>.
              </p>
              <div className="pt-2 text-xs font-semibold text-purple-300">
                {products.length} Products Configured
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Billing Plans & Policies
              </div>
              <p className="text-[11px] text-slate-400">
                Daily, Weekly, Monthly, and Yearly cycles with pause/renew rules and min quantities.
              </p>
              <div className="pt-2 text-xs font-semibold text-indigo-300">
                {plans.length} Active Plans Available
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                Discounts & 18% Tax Rules
              </div>
              <p className="text-[11px] text-slate-400">
                Fixed or percentage rules with min spend, expiration dates, and hard usage caps.
              </p>
              <Link href="/discounts" className="pt-2 block text-xs font-semibold text-emerald-300 hover:underline">
                Configure Discount Engine →
              </Link>
            </div>
          </div>

          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Monthly Recurring Revenue (MRR)</div>
              <div className="text-xl font-bold text-white mt-1">${stats?.mrr?.toLocaleString() || 0}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% growth
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Annual Run Rate (ARR)</div>
              <div className="text-xl font-bold text-purple-300 mt-1">${stats?.arr?.toLocaleString() || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Based on active contracts</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Active Subscriptions</div>
              <div className="text-xl font-bold text-indigo-300 mt-1">{stats?.activeSubscriptionsCount || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">{stats?.quotationsCount || 0} pending quotes</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Overdue Invoices</div>
              <div className="text-xl font-bold text-amber-300 mt-1">${stats?.overdueAmount?.toLocaleString() || 0}</div>
              <div className="text-[11px] text-amber-400 mt-1">{stats?.overdueInvoicesCount || 0} invoices past due</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION 3: INTERNAL STAFF (Quotes, Lifecycles, Invoices, Payments)    */}
      {/* ========================================================================= */}
      {activePortalView === 'STAFF' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Internal Staff Operations Desk
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sales and support team handles quotes, advances subscriptions, sends invoices, and records payments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/subscriptions"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Quote Pipeline</span>
              </Link>
              <Link
                href="/invoices"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
              >
                Invoices Desk
              </Link>
            </div>
          </div>

          {/* Quotations & Subscription State Machine */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Quotation to Subscription Lifecycle</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deterministic states: Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.
                </p>
              </div>
              <Link href="/subscriptions" className="text-xs text-indigo-400 hover:underline">
                View Full Pipeline →
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {stats?.recentSubscriptions?.slice(0, 4).map((sub: any) => (
                <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">
                      {sub.customer?.companyName || sub.customer?.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {sub.subscriptionNumber} • {sub.plan?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'QUOTATION'
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: PURCHASE NEW SUBSCRIPTION (With +$560 Odoo Variant Delta)       */}
      {/* ========================================================================= */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  Purchase & Activate Subscription
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select your product and plan. It will be activated immediately upon purchase.
                </p>
              </div>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePurchaseSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Purchasing For (Customer)</label>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white font-medium">
                  {selectedCustomer?.companyName} ({selectedCustomer?.email})
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Billing Plan *</label>
                <select
                  value={buyPlanId}
                  onChange={(e) => setBuyPlanId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.cost} ({p.billingFrequency || 'Monthly'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Product *</label>
                <select
                  value={buyProductId}
                  onChange={(e) => {
                    setBuyProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod?.variants && prod.variants.length > 0) {
                      setBuyVariantId(prod.variants[0].id);
                    } else {
                      setBuyVariantId('');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.salesPrice}
                    </option>
                  ))}
                </select>
              </div>

              {currentSelectedProduct?.variants && currentSelectedProduct.variants.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Variant (Optional Delta)
                  </label>
                  <select
                    value={buyVariantId}
                    onChange={(e) => setBuyVariantId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-purple-300 font-medium font-mono"
                  >
                    <option value="">Standard Edition ($0.00)</option>
                    {currentSelectedProduct.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.variantName || v.name} (+${v.priceAdjustment})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity (Seats / Units)</label>
                <input
                  type="number"
                  min={1}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Price Preview */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Price:</span>
                  <span className="font-mono text-slate-200">${basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({buyQuantity} units):</span>
                  <span className="font-mono text-slate-200">${previewSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>18% GST (CGST 9% + SGST 9%):</span>
                  <span className="font-mono font-medium">+${previewTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Due on Activation:</span>
                  <span className="font-mono text-emerald-400">${previewTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={buySubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {buySubmitting ? 'Activating...' : 'Confirm & Purchase Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
