'use client';

import React, { useEffect, useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  XCircle,
  Zap,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'BANK_TRANSFER',
    amount: '',
    referenceNote: '',
  });

  const fetchInvoices = () => {
    setLoading(true);
    fetch(`/api/invoices?status=${filterStatus}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          method: paymentData.method,
          amount: Number(paymentData.amount),
          referenceNote: paymentData.referenceNote,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setPaymentData({ method: 'BANK_TRANSFER', amount: '', referenceNote: '' });
        fetchInvoices();
        alert('🎉 Payment successfully recorded and matched to invoice!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
      }
    } catch (e) {
      alert('Error recording payment');
    }
  };

  const handlePrint = (inv: any) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const invStatusColors: any = {
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CONFIRMED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            Invoices & Recurring Billing Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated invoice generation from subscriptions, payment matching, and cash flow audit.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        {['ALL', 'CONFIRMED', 'PAID', 'DRAFT', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab === 'CONFIRMED' ? 'OUTSTANDING' : tab}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Subscription Link</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4">Subtotal / GST</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isOverdue =
                    inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date();
                  const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-medium text-purple-300">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {inv.customer?.companyName || inv.customer?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{inv.customer?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-mono">
                          {inv.subscription?.subscriptionNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {inv.subscription?.plan?.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300">
                          Issued: {new Date(inv.issueDate).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-[11px] flex items-center gap-1 font-medium ${
                            isOverdue ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300">${inv.subtotal?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">
                          GST 18%: +${inv.taxAmount?.toLocaleString()}
                        </div>
                        {inv.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Discount: -${inv.discountAmount?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ${inv.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full inline-block ${
                            invStatusColors[inv.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.status === 'CONFIRMED' && (
                          <div className="text-[10px] text-amber-300/80 mt-0.5">
                            Owed: ${remaining.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentData({
                                  method: 'BANK_TRANSFER',
                                  amount: String(remaining),
                                  referenceNote: '',
                                });
                                setShowPaymentModal(true);
                              }}
                              className="bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(inv)}
                            className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 px-2 py-1 rounded-lg transition flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Record Customer Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Invoice Number:</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-slate-200">
                  {selectedInvoice.customer?.companyName || selectedInvoice.customer?.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Invoice Amount:</span>
                <span className="font-bold text-white">
                  ${selectedInvoice.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Remaining Balance:</span>
                <span className="font-bold text-amber-400">
                  ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount)?.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS)</option>
                  <option value="CREDIT_CARD">Credit Card / Debit Card</option>
                  <option value="UPI">UPI / Instant NetBanking</option>
                  <option value="CASH">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Bank Reference / Transaction Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Ref: 98129038102"
                  value={paymentData.referenceNote}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNote: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-md"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
