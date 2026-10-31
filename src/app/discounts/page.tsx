'use client';

import React, { useEffect, useState } from 'react';
import { Percent, Plus, Tag, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE',
    value: '',
    minQuantity: 1,
    minPurchaseAmount: 0,
    maxUsageLimit: 50,
  });

  const fetchDiscounts = () => {
    setLoading(true);
    fetch('/api/discounts')
      .then((r) => r.json())
      .then((data) => {
        setDiscounts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          code: '',
          name: '',
          type: 'PERCENTAGE',
          value: '',
          minQuantity: 1,
          minPurchaseAmount: 0,
          maxUsageLimit: 50,
        });
        fetchDiscounts();
      } else {
        alert('Failed to create discount');
      }
    } catch (e) {
      alert('Error creating discount');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Percent className="w-6 h-6 text-purple-400" />
            Discount & Promotional Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Admin-governed rules: fixed amount or percentage with minimums and automatic usage caps.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition self-start"
        >
          <Plus className="w-4 h-4" />
          Create Discount Rule
        </button>
      </div>

      {/* Admin Notice */}
      <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-purple-300">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
        <span>
          <strong>Admin Governance Active:</strong> Discounts are automatically applied during billing cycles and self-terminate once the maximum usage threshold is reached.
        </span>
      </div>

      {/* Discounts Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Name</th>
                <th className="py-3 px-4">Type & Value</th>
                <th className="py-3 px-4">Min Spend / Qty</th>
                <th className="py-3 px-4">Usage Threshold</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading discount rules...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No discount rules found.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => {
                  const isExhausted = d.currentUsageCount >= d.maxUsageLimit;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300 tracking-wider">
                        {d.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{d.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-400">
                          {d.type === 'PERCENTAGE' ? `${d.value}% Off` : `$${d.value} Flat Off`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        Min ${d.minPurchaseAmount} • Min {d.minQuantity} seat(s)
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isExhausted ? 'bg-rose-500' : 'bg-purple-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (d.currentUsageCount / d.maxUsageLimit) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {d.currentUsageCount} / {d.maxUsageLimit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full inline-block ${
                            isExhausted
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isExhausted ? 'EXHAUSTED' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">New Admin Discount Rule</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER15"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Discount Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Year Promotional 15%"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15 or 500"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Usages</label>
                  <input
                    type="number"
                    value={formData.maxUsageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsageLimit: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-md"
                >
                  Save Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
