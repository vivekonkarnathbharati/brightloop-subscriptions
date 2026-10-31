'use client';

import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Building,
  Mail,
  Shield,
  FileText,
  Repeat,
  Download,
  Printer,
  Sparkles,
  Lock,
  PauseCircle,
  PlayCircle,
  XCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowRight,
  Receipt,
  Eye,
  IndianRupee,
  ShoppingCart,
  PlusCircle,
  Check,
  Zap,
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Active Tab for Mobile App Interface
  const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'BUY' | 'INVOICES'>('SUBSCRIPTIONS');

  // Modals
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<any>(null);

  // Buy Subscription Form
  const [buyPlanId, setBuyPlanId] = useState('');
  const [buyProductId, setBuyProductId] = useState('');
  const [buyVariantId, setBuyVariantId] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyPaymentTerms, setBuyPaymentTerms] = useState('Immediate');
  const [buyNotes, setBuyNotes] = useState('');
  const [buySubmitting, setBuySubmitting] = useState(false);

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Signup Form
  const [signupForm, setSignupForm] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  const fetchMasterData = () => {
    Promise.all([
      fetch('/api/customers').then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([custList, planList, prodList]) => {
      if (Array.isArray(custList) && custList.length > 0) {
        setCustomers(custList);
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetId = params?.get('customerId') || (typeof window !== 'undefined' ? localStorage.getItem('brightloop_customer_id') : null);

        if (targetId && custList.some((c: any) => c.id === targetId)) {
          setSelectedCustomerId(targetId);
        } else if (!selectedCustomerId) {
          setSelectedCustomerId(custList[0].id);
        }
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
    });
  };

  const loadCustomerData = (custId: string) => {
    if (!custId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/subscriptions?customerId=${custId}`).then((r) => r.json()),
      fetch(`/api/invoices?customerId=${custId}`).then((r) => r.json()),
    ])
      .then(([subData, invData]) => {
        setSubscriptions(Array.isArray(subData) ? subData : []);
        setInvoices(Array.isArray(invData) ? invData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching portal data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerData(selectedCustomerId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('brightloop_customer_id', selectedCustomerId);
      }
    }
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Password Validation Policy:
  // "more than eight characters, with an uppercase letter, a lowercase letter and a special character."
  const validatePassword = (pass: string) => {
    if (pass.length <= 8) return 'Password must be more than 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Must contain at least one uppercase letter (A-Z)';
    if (!/[a-z]/.test(pass)) return 'Must contain at least one lowercase letter (a-z)';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass))
      return 'Must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(signupForm.password);
    if (err) {
      setPasswordError(err);
      return;
    }
    setPasswordError('');
    setSignupSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupForm,
          role: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          `🎉 Account successfully created for ${signupForm.companyName}!\nYou are now securely logged in.`
        );
        setShowSignupModal(false);
        setSignupForm({ name: '', companyName: '', email: '', password: '', phone: '' });
        fetchMasterData();
        if (data.user?.id) {
          setSelectedCustomerId(data.user.id);
        }
      } else {
        alert(`❌ Registration error: ${data.error || 'Failed to create account'}`);
      }
    } catch (e) {
      alert('Network error while creating account.');
    } finally {
      setSignupSubmitting(false);
    }
  };

  // Customer Buys a New Subscription -> Sub becomes ACTIVE immediately!
  const handlePurchaseSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !buyPlanId || !buyProductId) {
      alert('Please select a customer, plan, and product');
      return;
    }
    setBuySubmitting(true);

    try {
      // 1. Create Subscription with status ACTIVE
      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: buyPlanId,
          paymentTerms: buyPaymentTerms,
          status: 'ACTIVE', // Automatically Active on purchase as requested!
          notes: buyNotes || 'Purchased directly via Customer Self-Service Portal',
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

      // 2. Generate First Billing Invoice for this subscription
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
        `🎉 Congratulations! Subscription ${subData.subscriptionNumber} is now ACTIVE! Your invoice has been generated.`
      );
      setShowBuyModal(false);
      setActiveTab('SUBSCRIPTIONS');
      loadCustomerData(selectedCustomerId);
    } catch (err: any) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setBuySubmitting(false);
    }
  };

  // Self-Service Subscription Lifecycle Actions (Pause / Resume / Cancel)
  const handleUpdateSubscriptionStatus = async (subscriptionId: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subscriptionId, status: nextStatus }),
      });
      if (res.ok) {
        loadCustomerData(selectedCustomerId);
      } else {
        alert('Could not update subscription status');
      }
    } catch (e) {
      alert('Error updating subscription');
    }
  };

  // Customer Pay Now Action
  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    setPaymentProcessing(true);

    const remainingAmount =
      selectedInvoiceForPayment.totalAmount - (selectedInvoiceForPayment.paidAmount || 0);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForPayment.id,
          method: paymentMethod,
          amount: remainingAmount,
          referenceNote: paymentNote || `Self-service portal settlement via ${paymentMethod}`,
        }),
      });

      if (res.ok) {
        alert(`✅ Payment of $${remainingAmount.toLocaleString()} successfully processed!`);
        setShowPaymentModal(false);
        setSelectedInvoiceForPayment(null);
        setPaymentNote('');
        loadCustomerData(selectedCustomerId);
      } else {
        const err = await res.json();
        alert(`Payment failed: ${err.error}`);
      }
    } catch (e) {
      alert('Payment processing error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Quick stats
  const activeSubsCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
  const totalDue = unpaidInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)),
    0
  );

  // Selected product and variant for live price preview in Buy Modal
  const currentSelectedProduct = products.find((p) => p.id === buyProductId);
  const currentSelectedVariant = currentSelectedProduct?.variants?.find((v: any) => v.id === buyVariantId);
  const currentSelectedPlan = plans.find((p) => p.id === buyPlanId);

  const basePrice = (currentSelectedProduct?.salesPrice || 0) + (currentSelectedVariant?.priceAdjustment || 0);
  const previewSubtotal = basePrice * (Number(buyQuantity) || 1);
  const previewTax = (previewSubtotal * 18) / 100;
  const previewTotal = previewSubtotal + previewTax;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mobile App Style Top Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <UserCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Customer Portal</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Self-Service App
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Browse plans, purchase & activate subscriptions, pause, resume, cancel, and pay invoices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowBuyModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Subscription</span>
            </button>
            <button
              onClick={() => setShowSignupModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>New Account</span>
            </button>
          </div>
        </div>

        {/* Customer ID Authenticated Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Active Tenant:</span>
            <strong className="text-white">
              {selectedCustomer?.companyName || selectedCustomer?.name}
            </strong>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              ID: {selectedCustomer?.id?.slice(0, 8)}...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Switch Customer ID:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 font-medium"
            >
              {customers.map((c, i) => (
                <option key={c.id} value={c.id}>
                  CUST-{String(i + 1).padStart(3, '0')}: {c.companyName || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile App Segmented Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'SUBSCRIPTIONS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>My Subscriptions ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BUY')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'BUY'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Buy Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'INVOICES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY SUBSCRIPTIONS (Pause, Resume, Cancel Early, Renew)              */}
      {/* ========================================================================= */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-400" />
              Manage Active & Recurring Plans
            </h2>
            <button
              onClick={() => setShowBuyModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Purchase Another Plan
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Repeat className="w-6 h-6" />
              </div>
              <div className="font-semibold text-white text-sm">No Active Subscriptions Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select from our software plans catalog and purchase your subscription to activate it instantly.
              </p>
              <button
                onClick={() => setShowBuyModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Browse & Buy Plans
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-purple-300 font-bold text-xs">
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
                          : s.status === 'QUOTATION'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Billing Cycle info */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Cycle:</span>
                      <strong className="text-slate-200 capitalize">
                        {s.plan?.billingFrequency || s.plan?.billingCycle || 'Monthly'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Payment Terms:</span>
                      <span className="text-slate-200">{s.paymentTerms}</span>
                    </div>
                    {/* Line items */}
                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                      {s.lines?.map((l: any, i: number) => (
                        <div key={i} className="flex justify-between text-[11px] text-slate-300">
                          <span>
                            • {l.product?.name}
                            {l.variant && (
                              <span className="text-purple-300 font-mono ml-1">
                                [{l.variant.variantName || l.variant.name}]
                              </span>
                            )}
                            <span className="text-slate-500 ml-1">x{l.quantity}</span>
                          </span>
                          <span className="font-mono font-semibold text-white">
                            ${l.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Self-Service Action Buttons: Pause, Resume, Cancel */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">Actions:</span>
                    <div className="flex items-center gap-1.5">
                      {s.status === 'QUOTATION' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Accept & Activate
                        </button>
                      )}

                      {/* Pause Action */}
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'PAUSED')}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <PauseCircle className="w-3 h-3" />
                          Pause
                        </button>
                      )}

                      {/* Resume Action */}
                      {s.status === 'PAUSED' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Resume
                        </button>
                      )}

                      {/* Cancel Early Action */}
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this subscription?')) {
                              handleUpdateSubscriptionStatus(s.id, 'CLOSED');
                            }
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}

                      {/* Renew Action */}
                      {s.status === 'CLOSED' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUY NEW PLAN (Browse Catalog & Activate Subscription)              */}
      {/* ========================================================================= */}
      {activeTab === 'BUY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                Available Subscription Plans & Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pick your preferred plan. When you purchase, your subscription will be activated instantly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.billingFrequency || 'MONTHLY'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Min Qty: {p.minQuantity || 1}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {p.description || 'Full enterprise software license with automated recurring billing.'}
                    </p>
                  </div>

                  <div className="text-2xl font-bold text-white font-mono">
                    ${p.cost?.toLocaleString() || 499}
                    <span className="text-xs font-normal text-slate-400">/{p.billingFrequency?.toLowerCase() || 'month'}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Pause & Resume allowed
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> 18% GST Compliance Invoice
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBuyPlanId(p.id);
                    setShowBuyModal(true);
                  }}
                  className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Subscribe & Activate Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVOICES & RECEIPTS (Pay UPI/Card, Download GST PDF)               */}
      {/* ========================================================================= */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Invoices & Tax Receipts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Outstanding balance: <strong className="text-amber-400">${totalDue.toLocaleString()}</strong> across {unpaidInvoices.length} unpaid bill(s).
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-xl overflow-hidden">
            {invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No invoices generated yet for this customer.
              </div>
            ) : (
              invoices.map((inv) => {
                const remaining = inv.totalAmount - (inv.paidAmount || 0);
                const isPaid = inv.status === 'PAID' || remaining <= 0;

                return (
                  <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition">
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                        {inv.invoiceNumber}
                        <button
                          onClick={() => {
                            setSelectedInvoiceForDetail(inv);
                            setShowInvoiceDetailModal(true);
                          }}
                          className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
                        >
                          <Eye className="w-2.5 h-2.5" /> Tax Breakdown
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Due: {new Date(inv.dueDate).toLocaleDateString()} • Issued:{' '}
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          ${inv.totalAmount?.toLocaleString()}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isPaid ? 'PAID' : inv.status}
                        </span>
                      </div>

                      {/* Pay Now Button */}
                      {!isPaid && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setShowPaymentModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-600/30 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Now
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedInvoiceForDetail(inv);
                          setShowInvoiceDetailModal(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUY & ACTIVATE NEW SUBSCRIPTION                                    */}
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
              {/* Select Plan */}
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

              {/* Select Product */}
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

              {/* Product Variant Selector */}
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

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity (Seats / Units)</label>
                  <input
                    type="number"
                    min={currentSelectedPlan?.minQuantity || 1}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Terms</label>
                  <select
                    value={buyPaymentTerms}
                    onChange={(e) => setBuyPaymentTerms(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="Immediate">Immediate (On Purchase)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                  </select>
                </div>
              </div>

              {/* Live Price Calculator */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Base Unit Price:</span>
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

      {/* ========================================================================= */}
      {/* MODAL: DIRECT PAYMENT (UPI, Card, Bank Wire)                              */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Pay Invoice: {selectedInvoiceForPayment.invoiceNumber}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total Payable:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  $
                  {(
                    selectedInvoiceForPayment.totalAmount -
                    (selectedInvoiceForPayment.paidAmount || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'CREDIT_CARD', 'BANK_TRANSFER'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                        paymentMethod === m
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m === 'UPI' ? '📱 UPI' : m === 'CREDIT_CARD' ? '💳 Card' : '🏦 Bank Wire'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Transaction Reference Note / UTR (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-TXN-8823901 or HDFC NetBanking"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {paymentProcessing ? 'Processing...' : 'Confirm & Settle Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INVOICE DETAILS & 18% GST BREAKDOWN                                */}
      {/* ========================================================================= */}
      {showInvoiceDetailModal && selectedInvoiceForDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  {selectedInvoiceForDetail.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Official Tax Invoice & SAC 997331 Compliance Breakdown
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceDetailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500">Customer</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {selectedCustomer?.companyName}
                  </div>
                  <div className="text-[11px] text-slate-400">{selectedCustomer?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Invoice Status</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedInvoiceForDetail.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Due: {new Date(selectedInvoiceForDetail.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-800/60 text-slate-400">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Taxable</th>
                      <th className="p-2.5 text-right">18% GST</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {selectedInvoiceForDetail.lines?.map((line: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-slate-200">
                          {line.product?.name || 'Software Subscription'}
                        </td>
                        <td className="p-2.5 text-center">{line.quantity}</td>
                        <td className="p-2.5 text-right font-mono">
                          ${line.subtotal?.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono text-purple-300">
                          ${line.taxAmount?.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          ${line.totalAmount?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal (Net Taxable):</span>
                  <span className="font-mono text-slate-200">
                    ${selectedInvoiceForDetail.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>18% GST (CGST 9% + SGST 9%):</span>
                  <span className="font-mono font-medium">
                    +${selectedInvoiceForDetail.taxAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-400">
                    ${selectedInvoiceForDetail.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceDetailModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW CUSTOMER SIGNUP (Strict Challenge Regex Password)               */}
      {/* ========================================================================= */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Client Onboarding Signup</h3>
              <button
                onClick={() => setShowSignupModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics Pvt Ltd"
                  value={signupForm.companyName}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, companyName: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Address (Unique) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@apexlogistics.in"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-400" />
                  Password (Enforced Complexity) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="> 8 chars, Uppercase, Lowercase, Special char"
                  value={signupForm.password}
                  onChange={(e) => {
                    setSignupForm({ ...signupForm, password: e.target.value });
                    setPasswordError(validatePassword(e.target.value));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {passwordError ? (
                  <p className="text-[11px] text-rose-400 mt-1">⚠️ {passwordError}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Requirements: &gt;8 chars, uppercase, lowercase, special character.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signupSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {signupSubmitting ? 'Creating...' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
