'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { TaxRule } from '@/lib/types';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { Plus, Lock, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export function TaxesView() {
  const { taxRules, isAdmin, createTaxRule, updateTaxRule, deleteTaxRule } = useBrightloop();
  
  // Add tax modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [rate, setRate] = useState(18);
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Edit tax modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState(18);
  const [editDescription, setEditDescription] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);

  // Delete tax modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<TaxRule | null>(null);

  const handleCreateTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !name) return;
    createTaxRule({
      name,
      rate,
      description,
      isDefault,
    });
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setIsDefault(false);
  };

  const openEditModal = (tax: TaxRule) => {
    setEditingTax(tax);
    setEditName(tax.name);
    setEditRate(tax.rate);
    setEditDescription(tax.description || '');
    setEditIsDefault(tax.isDefault);
    setIsEditModalOpen(true);
  };

  const handleUpdateTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingTax || !editName) return;
    updateTaxRule(editingTax.id, {
      name: editName,
      rate: editRate,
      description: editDescription,
      isDefault: editIsDefault,
    });
    setIsEditModalOpen(false);
    setEditingTax(null);
  };

  const openDeleteModal = (tax: TaxRule) => {
    setTaxToDelete(tax);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!isAdmin || !taxToDelete) return;
    deleteTaxRule(taxToDelete.id);
    setIsDeleteModalOpen(false);
    setTaxToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={32} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Tax Engine & Jurisdictions
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Full Admin Authority
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Admin configured statutory tax rates automatically applied during billing generation.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Tax Rule</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin-Only Action</span>
          </div>
        )}
      </div>

      {/* Tax Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {taxRules.map((tax) => (
          <div
            key={tax.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{tax.name}</span>
                <div className="flex items-center gap-1.5">
                  {tax.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4ECE1] text-[#7A4B20] font-bold uppercase border border-[#E5D7C5]">
                      Default
                    </span>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => openEditModal(tax)}
                        className="p-1 hover:bg-[#F3EBE0] text-[#7A4B20] rounded-md transition-colors"
                        title="Edit tax rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(tax)}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                        title="Delete tax rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#2C2621] mb-2">{tax.rate}%</div>
              <p className="text-xs text-slate-500 line-clamp-2">{tax.description || 'Statutory sales tax.'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-4">
              Auto-applied to line items on invoice generation.
            </div>
          </div>
        ))}
      </div>

      {/* Add Tax Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Add Tax Rule</h3>
                <p className="text-xs text-[#7A6D61]">Configure statutory jurisdiction rate</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTax} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU Digital VAT (21%)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Tax Rate Percentage (%) *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  required
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-bold focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Jurisdiction and applicability..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultTax"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-[#B88457] focus:ring-[#B88457]"
                />
                <label htmlFor="defaultTax" className="text-[#4A3C30] cursor-pointer">
                  Set as default statutory tax rule for new quotes & invoices
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E5D7C5] rounded-xl text-[#5A4D42] font-semibold hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tax Modal */}
      {isEditModalOpen && editingTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Edit Tax Rule</h3>
                <p className="text-xs text-[#7A6D61]">Update jurisdiction percentage and defaults</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateTax} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Tax Rate Percentage (%) *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  required
                  value={editRate}
                  onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-bold focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editDefaultTax"
                  checked={editIsDefault}
                  onChange={(e) => setEditIsDefault(e.target.checked)}
                  className="rounded text-[#B88457] focus:ring-[#B88457]"
                />
                <label htmlFor="editDefaultTax" className="text-[#4A3C30] cursor-pointer">
                  Set as default statutory tax rule
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#E5D7C5] rounded-xl text-[#5A4D42] font-semibold hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tax Confirmation Modal */}
      {isDeleteModalOpen && taxToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Tax Rule?</h3>
                <p className="text-xs text-slate-500">Remove jurisdiction rate</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{taxToDelete.name}</span> ({taxToDelete.rate}%)? Historical invoices will preserve their recorded tax calculations.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
