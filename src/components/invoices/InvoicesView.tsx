'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, isInvoiceOverdue } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import {
  Zap,
  Printer,
  Search,
  XCircle,
  FileText,
  Send,
  CreditCard,
  Check,
} from 'lucide-react';

export function InvoicesView({ onRecordPayment }: { onRecordPayment?: (invoiceId: string) => void }) {
  const {
    invoices,
    updateInvoiceStatus,
    runBillingDay,
    addNotification,
  } = useBrightloop();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [billingResultModal, setBillingResultModal] = useState<{
    open: boolean;
    generated: number;
    skipped: number;
    messages: string[];
  }>({ open: false, generated: 0, skipped: 0, messages: [] });

  const filteredInvoices = invoices.filter((inv) => {
    const isOverdue = isInvoiceOverdue(inv);
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.subscriptionNumber && inv.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'OVERDUE') {
      return matchesSearch && isOverdue;
    }
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunBilling = () => {
    const res = runBillingDay();
    setBillingResultModal({
      open: true,
      generated: res.generatedCount,
      skipped: res.skippedCount,
      messages: res.messages,
    });
  };

  const handleSendInvoice = (inv: Invoice) => {
    addNotification(`Invoice ${inv.invoiceNumber} emailed to ${inv.customerEmail} with payment link.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Billing Run Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={34} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
              Billing Engine & Invoices
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Automated recurring generation with{' '}
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Zero Double-Billing Guard
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBilling}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Execute "Billing Day" Batch Run</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A09285] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice#, customer, sub#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE2D5] rounded-xl text-xs placeholder-[#A09285] focus:outline-none focus:ring-2 focus:ring-[#C29367] shadow-sm"
          />
        </div>

        {/* State filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-[#F2ECE4] rounded-xl border border-[#E5DDD0] text-xs">
          {['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all text-xs whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-[#2C2621] shadow-sm font-bold'
                  : 'text-[#6A5E53] hover:text-[#2C2621]'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Period / Sub</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount Due / Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No invoices match this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const overdue = isInvoiceOverdue(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Inv Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPrintModalOpen(true);
                          }}
                          className="hover:text-sky-600 hover:underline flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {inv.invoiceNumber}
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                      </td>

                      {/* Sub & Period */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700 text-[11px]">
                          {inv.subscriptionNumber || 'Ad-hoc'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatDate(inv.billingPeriodStart)} - {formatDate(inv.billingPeriodEnd)}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4">
                        <div className={`font-medium ${overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {formatDate(inv.dueDate)}
                        </div>
                        {overdue && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1 py-0.5 rounded">
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : overdue
                              ? 'bg-rose-100 text-rose-800'
                              : inv.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : inv.status === 'CANCELLED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {overdue ? 'OVERDUE' : inv.status}
                        </span>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</div>
                        <div className="text-[10px] text-slate-500">
                          {inv.amountDue > 0 ? (
                            <span className="text-rose-600 font-semibold">
                              Due: {formatCurrency(inv.amountDue)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">Fully Paid</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print/View */}
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                            title="Print / View Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Email Send */}
                          <button
                            onClick={() => handleSendInvoice(inv)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                            title="Send to Customer Email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Draft -> Confirm */}
                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => updateInvoiceStatus(inv.id, 'CONFIRMED')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Record Payment Trigger */}
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && onRecordPayment && (
                            <button
                              onClick={() => onRecordPayment(inv.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}

                          {/* Cancel */}
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => updateInvoiceStatus(inv.id, 'CANCELLED')}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Cancel Invoice"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Clean Printable Invoice Modal (Prompt requirement: "send or print any invoice") */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6 print:shadow-none print:border-none print:p-0">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-semibold text-slate-500">Official Brightloop Tax Invoice</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-lg text-xs font-semibold shadow-sm shadow-[#C29367]/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 border border-[#EAE2D5] rounded-lg text-xs font-semibold text-[#5A4D42] hover:bg-[#FAF7F2]"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6">
              {/* Invoice Header with Official Brightloop Logo */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <BrightloopLogo size={42} showWordmark={true} />
                  <p className="text-xs text-slate-500">SaaS & Enterprise Subscription Systems</p>
                  <p className="text-xs text-slate-500">Tax ID: US-EIN-992-019284-BL</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-slate-900">{selectedInvoice.invoiceNumber}</div>
                  <div className="mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        selectedInvoice.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billed To / Dates Grid */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1">
                    Billed To:
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{selectedInvoice.customerName}</div>
                  <div className="text-slate-500">{selectedInvoice.customerEmail}</div>
                  <div className="text-slate-500 mt-1 font-mono">
                    Ref Sub: {selectedInvoice.subscriptionNumber || 'N/A'}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500">Invoice Date: </span>
                    <span className="font-semibold text-slate-900">{formatDate(selectedInvoice.invoiceDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Due: </span>
                    <span className="font-semibold text-rose-700">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Period: </span>
                    <span className="text-slate-700">
                      {formatDate(selectedInvoice.billingPeriodStart)} - {formatDate(selectedInvoice.billingPeriodEnd)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left text-xs">
                <thead className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Tax (18%)</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3 font-medium text-slate-900">{l.productName}</td>
                      <td className="py-3 text-center">{l.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(l.unitPrice)}</td>
                      <td className="py-3 text-right">{formatCurrency(l.taxAmount)}</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedInvoice.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (GST 18%):</span>
                    <span>{formatCurrency(selectedInvoice.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t-2 border-slate-900">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold text-sm">
                    <span>Amount Due:</span>
                    <span>{formatCurrency(selectedInvoice.amountDue)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Bank Details */}
              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Payment Instructions:</p>
                <p>Bank Transfer: Silicon Valley Bank • Account: 0891-2381-992 • Routing: 121000358</p>
                <p>UPI ID: brightloop@okaxis • Credit Card portal supported.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Batch Result Report Modal */}
      {billingResultModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Billing Day Batch Execution Report</h3>
                <p className="text-xs text-slate-500">Automated cycle results & double-billing enforcement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-700">{billingResultModal.generated}</div>
                <div className="text-xs font-semibold text-emerald-900">Invoices Generated</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-slate-700">{billingResultModal.skipped}</div>
                <div className="text-xs font-semibold text-slate-600">Skipped (Already Billed)</div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs text-slate-600 font-mono">
              {billingResultModal.messages.map((m, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBillingResultModal({ open: false, generated: 0, skipped: 0, messages: [] })}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
