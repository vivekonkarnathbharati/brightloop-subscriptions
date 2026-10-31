'use client';

import React, { useEffect, useState } from 'react';
import {
  Repeat,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Play,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    planId: '',
    paymentTerms: 'Net 15',
    status: 'QUOTATION',
    notes: '',
    productId: '',
    variantId: '',
    quantity: 1,
  });

  const fetchSubscriptions = () => {
    setLoading(true);
    fetch(`/api/subscriptions?status=${filterStatus}`)
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus]);

  useEffect(() => {
    fetch('/api/customers').then((r) => r.json()).then(setCustomers);
    fetch('/api/plans').then((r) => r.json()).then(setPlans);
    fetch('/api/products').then((r) => r.json()).then(setProducts);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchSubscriptions();
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleGenerateInvoice = async (subscriptionId: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`🎉 Invoice ${data.invoiceNumber} successfully created from subscription!`);
        fetchSubscriptions();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (e) {
      alert('Error creating invoice');
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.planId || !formData.productId) {
      alert('Please select a customer, a plan, and a primary product.');
      return;
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId,
          planId: formData.planId,
          paymentTerms: formData.paymentTerms,
          status: formData.status,
          notes: formData.notes,
          lines: [
            {
              productId: formData.productId,
              variantId: formData.variantId || undefined,
              quantity: Number(formData.quantity) || 1,
            },
          ],
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchSubscriptions();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create subscription');
      }
    } catch (e) {
      alert('Error submitting subscription');
    }
  };

  const statusColors: any = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    QUOTATION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    CLOSED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-purple-400" />
            Subscriptions & Quotes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track subscription lifecycles from Draft quotation to Active recurring billing.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition self-start"
        >
          <Plus className="w-4 h-4" />
          New Subscription / Quote
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {['ALL', 'ACTIVE', 'QUOTATION', 'CONFIRMED', 'DRAFT', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan & Frequency</th>
                <th className="py-3 px-4">Products & Variants</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status Lifecycle</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No subscriptions found for status: {filterStatus}
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const subTotal = sub.lines?.reduce((a: any, b: any) => a + b.totalAmount, 0) || 0;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        {sub.subscriptionNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {sub.customer?.companyName || sub.customer?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{sub.customer?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{sub.plan?.name}</div>
                        <div className="text-[11px] text-purple-400 font-medium">
                          {sub.plan?.billingFrequency}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {sub.lines?.map((line: any, idx: number) => (
                          <div key={idx} className="text-[11px] text-slate-300">
                            • {line.product?.name}
                            {line.variant && (
                              <span className="text-purple-300 font-medium ml-1">
                                ({line.variant.variantName})
                              </span>
                            )}
                            <span className="text-slate-500 ml-1">x{line.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        ${subTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full inline-block ${
                            statusColors[sub.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'QUOTATION')}
                              className="bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded-lg transition"
                            >
                              Send Quote
                            </button>
                          )}
                          {sub.status === 'QUOTATION' && (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'ACTIVE')}
                              className="bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Confirm & Activate
                            </button>
                          )}
                          {sub.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleGenerateInvoice(sub.id)}
                              className="bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              Generate Invoice
                            </button>
                          )}
                          {sub.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'CLOSED')}
                              className="bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white px-2 py-1 rounded-lg transition"
                            >
                              Close
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">New Subscription Quotation</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subscription Plan *</label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.cost} / {p.billingFrequency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.salesPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Variant (Optional)</label>
                  <select
                    value={formData.variantId}
                    onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">No Variant</option>
                    {products
                      .find((p) => p.id === formData.productId)
                      ?.variants?.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.variantName} (+${v.priceAdjustment})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="QUOTATION">Quotation (Sales Offer)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Directly Active</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-md"
                >
                  Create Subscription Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
