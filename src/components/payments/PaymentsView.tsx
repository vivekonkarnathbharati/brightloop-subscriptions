'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { PaymentMethod } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  CreditCard,
  Plus,
  Search,
  Building,
  Smartphone,
} from 'lucide-react';

export function PaymentsView({ defaultInvoiceId }: { defaultInvoiceId?: string }) {
  const { payments, invoices, recordPayment } = useBrightloop();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(!!defaultInvoiceId);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInvoiceId || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentNote, setPaymentNote] = useState('');
  const [referenceId, setReferenceId] = useState('');

  // Unpaid invoices available for payment
  const unpaidInvoices = invoices.filter((i) => i.amountDue > 0);

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleOpenModal = (invId?: string) => {
    const targetId = invId || (unpaidInvoices.length > 0 ? unpaidInvoices[0].id : '');
    setSelectedInvoiceId(targetId);
    const targetInv = invoices.find((i) => i.id === targetId);
    if (targetInv) {
      setPaymentAmount(targetInv.amountDue);
    }
    setIsRecordModalOpen(true);
  };

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const targetInv = invoices.find((i) => i.id === invId);
    if (targetInv) {
      setPaymentAmount(targetInv.amountDue);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    recordPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      amount: paymentAmount,
      method: paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      note: paymentNote,
      referenceId: referenceId || `TXN-${Date.now().toString().slice(-6)}`,
    });

    setIsRecordModalOpen(false);
    setPaymentNote('');
    setReferenceId('');
  };

  const filteredPayments = payments.filter((p) => {
    return (
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={34} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
              Payments & Collections Ledger
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Multi-channel payment reconciliation: Bank Transfer, Credit Card, and UPI.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          disabled={unpaidInvoices.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Incoming Payment</span>
        </button>
      </div>

      {/* Financial Health Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Collected</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(payments.reduce((acc, p) => acc + p.amount, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{payments.length} settled payments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Outstanding Invoices</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(unpaidInvoices.reduce((acc, i) => acc + i.amountDue, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{unpaidInvoices.length} invoices with balance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Preferred Methods</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md">UPI</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">Wire/NEFT</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-md">Card</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by PAY#, Invoice#, Customer, Method..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Txn / Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{pay.paymentNumber}</td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">{pay.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{pay.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        {pay.method === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-sky-600" />}
                        {pay.method === 'BANK_TRANSFER' && <Building className="w-3.5 h-3.5 text-blue-600" />}
                        {pay.method === 'CREDIT_CARD' && <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                        {pay.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {pay.referenceId || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(pay.paymentDate)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(pay.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <BrightloopLogo size={26} palette="fintech" showWordmark={false} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Customer Payment</h3>
                  <p className="text-xs text-slate-500">Matches payment against target unpaid invoice</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              {/* Select target invoice */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Invoice *</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Unpaid Invoice --</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName} (Due: ${inv.amountDue.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice Total:</span>
                    <span className="font-semibold">{formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Balance:</span>
                    <span className="text-rose-600">{formatCurrency(selectedInvoice.amountDue)}</span>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Channel *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'BANK_TRANSFER', 'CREDIT_CARD'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-xl border text-center font-semibold text-xs transition-all ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m === 'BANK_TRANSFER' ? 'Bank Wire' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Reference / UPI Ref #</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/8372018 or NEFT-83921"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scanned QR code at checkout"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                >
                  Confirm & Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
