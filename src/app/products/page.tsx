'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Layers, Tag, Check, Sparkles } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // New Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    type: 'SOFTWARE',
    salesPrice: '',
    costPrice: '',
    notes: '',
    variantName: 'Brand: Odoo Enterprise Edition',
    variantPrice: '560',
  });

  // New Plan Form State
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    cost: '',
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    canPause: true,
    canRenew: true,
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json()),
    ]).then(([prodData, planData]) => {
      setProducts(Array.isArray(prodData) ? prodData : []);
      setPlans(Array.isArray(planData) ? planData : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const variants = productForm.variantName
        ? [
            {
              variantName: productForm.variantName,
              priceAdjustment: Number(productForm.variantPrice) || 0,
            },
          ]
        : [];

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          type: productForm.type,
          salesPrice: Number(productForm.salesPrice),
          costPrice: Number(productForm.costPrice) || 0,
          notes: productForm.notes,
          variants,
        }),
      });

      if (res.ok) {
        setShowProductModal(false);
        setProductForm({
          name: '',
          type: 'SOFTWARE',
          salesPrice: '',
          costPrice: '',
          notes: '',
          variantName: '',
          variantPrice: '',
        });
        fetchData();
      } else {
        alert('Failed to create product');
      }
    } catch (e) {
      alert('Error creating product');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
      });

      if (res.ok) {
        setShowPlanModal(false);
        setPlanForm({
          name: '',
          description: '',
          cost: '',
          billingFrequency: 'MONTHLY',
          minQuantity: 1,
          canPause: true,
          canRenew: true,
        });
        fetchData();
      } else {
        alert('Failed to create plan');
      }
    } catch (e) {
      alert('Error creating plan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Products & Subscription Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure catalog items, brand variants (+560 Odoo variant), and recurring billing cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products & Variants */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Product Catalog & Variants
            </h2>
            <span className="text-[11px] text-slate-400">{products.length} Products</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {products.map((p) => (
              <div key={p.id} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-200">{p.name}</div>
                  <div className="text-xs font-bold text-purple-300">${p.salesPrice}</div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                    {p.type}
                  </span>
                  <span>Cost: ${p.costPrice}</span>
                  {p.notes && <span>• {p.notes}</span>}
                </div>

                {/* Variants List */}
                {p.variants?.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-purple-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-purple-400 tracking-wider">
                      Available Variants:
                    </span>
                    {p.variants.map((v: any) => (
                      <div
                        key={v.id}
                        className="text-[11px] text-slate-300 flex items-center justify-between"
                      >
                        <span>{v.variantName}</span>
                        <span className="text-emerald-400 font-medium">
                          {v.priceAdjustment >= 0 ? `+` : ''}${v.priceAdjustment}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              Subscription Plans & Frequencies
            </h2>
            <span className="text-[11px] text-slate-400">{plans.length} Plans</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {plans.map((pl) => (
              <div key={pl.id} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-200">{pl.name}</div>
                  <div className="text-xs font-bold text-indigo-300">
                    ${pl.cost} /{' '}
                    <span className="text-[10px] text-slate-400 uppercase">
                      {pl.billingFrequency}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{pl.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>Min Quantity: {pl.minQuantity}</span>
                  <span>•</span>
                  <span>Can Pause: {pl.canPause ? '✅ Yes' : '❌ No'}</span>
                  <span>•</span>
                  <span>Can Renew: {pl.canRenew ? '✅ Yes' : '❌ No'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create New Product</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Analytics Suite"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SOFTWARE">Software License</option>
                    <option value="ADDON">Add-on Feature</option>
                    <option value="SERVICE">Service / Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sales Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.salesPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, salesPrice: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Variant Field */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Product Variant (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Brand: Odoo"
                    value={productForm.variantName}
                    onChange={(e) =>
                      setProductForm({ ...productForm, variantName: e.target.value })
                    }
                    className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Adjustment (+560)"
                    value={productForm.variantPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, variantPrice: e.target.value })
                    }
                    className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-[11px] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={productForm.notes}
                  onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create Subscription Plan</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Monthly"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Billing Frequency</label>
                  <select
                    value={planForm.billingFrequency}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, billingFrequency: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base Cost ($) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.cost}
                    onChange={(e) => setPlanForm({ ...planForm, cost: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Includes 5 user seats and priority SLA"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-md"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
