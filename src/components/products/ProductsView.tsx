'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { ProductType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { Plus, Tag, Sparkles } from 'lucide-react';

export function ProductsView() {
  const { products, createProduct, addProductVariant } = useBrightloop();

  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [selectedProductIdForVariant, setSelectedProductIdForVariant] = useState<string | null>(null);

  // New product form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ProductType>('SOFTWARE');
  const [salesPrice, setSalesPrice] = useState(199);
  const [costPrice, setCostPrice] = useState(50);
  const [notes, setNotes] = useState('');

  // New variant form
  const [variantAttr, setVariantAttr] = useState('Brand');
  const [variantValue, setVariantValue] = useState('Odoo Integration');
  const [variantDelta, setVariantDelta] = useState(560); // Default to hackathon example +560

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    createProduct({
      name,
      code,
      type,
      salesPrice,
      costPrice,
      notes,
    });
    setIsNewProductOpen(false);
    setName('');
    setCode('');
    setNotes('');
  };

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdForVariant || !variantValue) return;
    addProductVariant(selectedProductIdForVariant, {
      name: `${variantAttr}: ${variantValue} (+${variantDelta})`,
      attributeName: variantAttr,
      attributeValue: variantValue,
      priceDelta: variantDelta,
    });
    setSelectedProductIdForVariant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={34} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
              Products & Variants Studio
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Manage recurring modules, add-ons, and brand variants (e.g.,{' '}
              <span className="font-semibold text-[#8F5927]">Odoo Brand adds +$560</span>).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewProductOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                    {prod.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{prod.name}</h3>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    prod.type === 'SOFTWARE'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : prod.type === 'ADDON'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {prod.type}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{prod.notes || 'Standard subscription product.'}</p>

              {/* Base Price & Margin */}
              <div className="flex items-baseline justify-between p-3 bg-slate-50 rounded-xl mb-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Base Sales Price</div>
                  <div className="text-base font-bold text-slate-900">{formatCurrency(prod.salesPrice)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Gross Margin</div>
                  <div className="text-xs font-semibold text-emerald-600">
                    {formatCurrency(prod.salesPrice - prod.costPrice)} (
                    {Math.round(((prod.salesPrice - prod.costPrice) / prod.salesPrice) * 100)}%)
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Available Variants ({prod.variants.length})
                  </span>
                  <button
                    onClick={() => setSelectedProductIdForVariant(prod.id)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    + Add Variant
                  </button>
                </div>

                {prod.variants.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic py-1">
                    No variants. Ships as base product.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {prod.variants.map((v) => (
                      <div
                        key={v.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                          v.attributeValue === 'Odoo'
                            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {v.attributeValue === 'Odoo' && <Sparkles className="w-3 h-3 text-indigo-600" />}
                          <span className="font-medium">{v.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {v.priceDelta > 0 ? `+${formatCurrency(v.priceDelta)}` : 'Included'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Ready for Quotes & Plans</span>
              <button
                onClick={() => setSelectedProductIdForVariant(prod.id)}
                className="text-slate-600 hover:text-indigo-600 font-semibold"
              >
                Configure &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
                <p className="text-xs text-slate-500">Define software module, add-on, or service</p>
              </div>
              <button
                onClick={() => setIsNewProductOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Payroll & HR"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BL-PAY-05"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProductType)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="SOFTWARE">Software Module</option>
                    <option value="ADDON">Add-On Feature</option>
                    <option value="SERVICE">Managed Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Price ($) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes or feature capabilities..."
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {selectedProductIdForVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Variant Option</h3>
                <p className="text-xs text-slate-500">Configure price delta (+560 for Odoo brand, etc.)</p>
              </div>
              <button
                onClick={() => setSelectedProductIdForVariant(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attribute Type</label>
                <select
                  value={variantAttr}
                  onChange={(e) => setVariantAttr(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  <option value="Brand">Brand (e.g. Odoo)</option>
                  <option value="Edition">Edition (Standard / Enterprise)</option>
                  <option value="Hosting">Hosting (Cloud / On-Premise)</option>
                  <option value="Seats">Seats Tier</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attribute Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odoo Brand Integration"
                  value={variantValue}
                  onChange={(e) => setVariantValue(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price Delta ($) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="560"
                  value={variantDelta}
                  onChange={(e) => setVariantDelta(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Adds this amount directly to the base product price when chosen.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProductIdForVariant(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Attach Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
