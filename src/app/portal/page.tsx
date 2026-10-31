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
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<any>(null);

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

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetId = params?.get('customerId') || (typeof window !== 'undefined' ? localStorage.getItem('brightloop_customer_id') : null);

        if (targetId && data.some((c: any) => c.id === targetId)) {
          setSelectedCustomerId(targetId);
        } else if (!selectedCustomerId) {
          setSelectedCustomerId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load customers', e);
    }
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
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerData(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Exact Hackathon Problem Statement Password Validation:
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
        await fetchCustomers();
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

  // Self-Service Subscription Lifecycle Actions
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Customer Self-Service Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secure client portal where customers view and manage only their own active subscriptions, review quotations, and pay invoices without emailing support.
          </p>
        </div>

        <button
          onClick={() => setShowSignupModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition self-start"
        >
          <Sparkles className="w-4 h-4" />
          New Customer Signup
        </button>
      </div>

      {/* Authenticated Customer Switcher Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Session Active
            </div>
            <div className="font-bold text-slate-100 text-sm">
              {selectedCustomer?.companyName || selectedCustomer?.name}
            </div>
            <div className="text-[11px] text-slate-400">{selectedCustomer?.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Switch Tenant Profile:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards for the Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Active Plans</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{activeSubsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recurring software licenses</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Outstanding Balance</div>
          <div className={`text-xl font-bold mt-1 ${totalDue > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            ${totalDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Subscriptions</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{subscriptions.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all contract lifecycles</div>
        </div>
      </div>

      {/* Pending Quotations Alert Banner (if any) */}
      {subscriptions.some((s) => s.status === 'QUOTATION') && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-200">
                You have a pending Quotation offer from Brightloop Sales!
              </div>
              <div className="text-[11px] text-slate-300">
                Review the line items and click "Accept & Activate" to start your recurring subscription.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Columns: Subscriptions & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Subscriptions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-400" />
              My Subscriptions
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              {subscriptions.length} records
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No subscriptions on record for {selectedCustomer?.companyName || 'this customer'}.
              </div>
            ) : (
              subscriptions.map((s) => (
                <div key={s.id} className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-purple-300 font-bold text-xs">
                        {s.subscriptionNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        Plan: <strong className="text-slate-200">{s.plan?.name}</strong> (
                        {s.plan?.billingCycle})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'QUOTATION'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : s.status === 'PAUSED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Line Items */}
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 text-[11px] text-slate-300 space-y-1">
                    {s.lines?.map((l: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          • {l.product?.name}
                          {l.variant && (
                            <span className="text-purple-300 font-mono ml-1">
                              [{l.variant.name} (+${l.variant.priceAdjustment})]
                            </span>
                          )}
                          <span className="text-slate-500 ml-1">x{l.quantity}</span>
                        </div>
                        <span className="font-semibold text-slate-200 font-mono">
                          ${l.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Self-Service Action Buttons as per Plan Permissions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-slate-500">
                      Payment Terms: {s.paymentTerms}
                    </span>

                    <div className="flex items-center gap-2">
                      {s.status === 'QUOTATION' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Accept & Activate
                        </button>
                      )}

                      {s.status === 'ACTIVE' && s.plan?.canPause && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'PAUSED')}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition"
                        >
                          <PauseCircle className="w-3 h-3" />
                          Pause
                        </button>
                      )}

                      {s.status === 'PAUSED' && (
                        <button
                          onClick={() => handleUpdateSubscriptionStatus(s.id, 'ACTIVE')}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Resume
                        </button>
                      )}

                      {s.status === 'ACTIVE' && s.plan?.canCloseEarly && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this subscription early?')) {
                              handleUpdateSubscriptionStatus(s.id, 'CLOSED');
                            }
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}

                      {s.status === 'CLOSED' && s.plan?.canRenew && (
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
              ))
            )}
          </div>
        </div>

        {/* Customer Invoices & Receipts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              My Invoices & Receipts
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{invoices.length} invoices</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No invoices generated yet for this customer.
              </div>
            ) : (
              invoices.map((inv) => {
                const remaining = inv.totalAmount - (inv.paidAmount || 0);
                const isPaid = inv.status === 'PAID' || remaining <= 0;

                return (
                  <div key={inv.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-200 flex items-center gap-2">
                        {inv.invoiceNumber}
                        <button
                          onClick={() => {
                            setSelectedInvoiceForDetail(inv);
                            setShowInvoiceDetailModal(true);
                          }}
                          className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
                        >
                          <Eye className="w-2.5 h-2.5" /> Details
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Due: {new Date(inv.dueDate).toLocaleDateString()} • Issued:{' '}
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-white font-mono">
                          ${inv.totalAmount?.toLocaleString()}
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isPaid ? 'PAID' : inv.status}
                        </span>
                      </div>

                      {/* Pay Now Button for Unpaid Invoices */}
                      {!isPaid && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setShowPaymentModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-600/20 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay
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
      </div>

      {/* Pay Now Modal */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
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
                <label className="block text-slate-300 font-medium mb-1.5">
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
                <label className="block text-slate-300 font-medium mb-1">
                  Transaction Reference / UTR Note (Optional)
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {paymentProcessing ? 'Processing...' : 'Confirm & Settle Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details & GST Breakdown Modal */}
      {showInvoiceDetailModal && selectedInvoiceForDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  {selectedInvoiceForDetail.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tax Invoice & SAC 997331 Compliance Breakdown
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
                  <div className="text-[10px] text-slate-500">Billed To</div>
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
                {selectedInvoiceForDetail.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Applied:</span>
                    <span className="font-mono">
                      -${selectedInvoiceForDetail.discountAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal with Exact Problem Statement Password Validation */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
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
                <label className="block text-slate-300 font-medium mb-1">
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
                <label className="block text-slate-300 font-medium mb-1">Contact Person *</label>
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
                <label className="block text-slate-300 font-medium mb-1">
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
                <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50"
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
