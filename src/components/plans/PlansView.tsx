'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { BillingFrequency, Plan } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { Plus, Edit2, Trash2, AlertTriangle, Lock } from 'lucide-react';

export function PlansView() {
  const { plans, createPlan, updatePlan, deletePlan, isAdmin } = useBrightloop();
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);

  // New Plan form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState(199);
  const [frequency, setFrequency] = useState<BillingFrequency>('MONTHLY');
  const [minQuantity, setMinQuantity] = useState(1);
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenew, setAllowRenew] = useState(true);
  const [description, setDescription] = useState('');

  // Edit Plan state
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editPrice, setEditPrice] = useState(199);
  const [editFrequency, setEditFrequency] = useState<BillingFrequency>('MONTHLY');
  const [editMinQuantity, setEditMinQuantity] = useState(1);
  const [editAutoCloseOnEnd, setEditAutoCloseOnEnd] = useState(false);
  const [editAllowEarlyClose, setEditAllowEarlyClose] = useState(true);
  const [editAllowPause, setEditAllowPause] = useState(true);
  const [editAllowRenew, setEditAllowRenew] = useState(true);
  const [editDescription, setEditDescription] = useState('');

  // Delete Plan state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    createPlan({
      name,
      code,
      price,
      frequency,
      minQuantity,
      startDate: new Date().toISOString().split('T')[0],
      autoCloseOnEnd,
      allowEarlyClose,
      allowPause,
      allowRenew,
      description,
    });

    setIsNewPlanOpen(false);
    setName('');
    setCode('');
    setDescription('');
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditCode(plan.code);
    setEditPrice(plan.price);
    setEditFrequency(plan.frequency);
    setEditMinQuantity(plan.minQuantity);
    setEditAutoCloseOnEnd(plan.autoCloseOnEnd);
    setEditAllowEarlyClose(plan.allowEarlyClose);
    setEditAllowPause(plan.allowPause);
    setEditAllowRenew(plan.allowRenew);
    setEditDescription(plan.description || '');
    setIsEditPlanOpen(true);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editName || !editCode) return;

    updatePlan(editingPlan.id, {
      name: editName,
      code: editCode,
      price: editPrice,
      frequency: editFrequency,
      minQuantity: editMinQuantity,
      autoCloseOnEnd: editAutoCloseOnEnd,
      allowEarlyClose: editAllowEarlyClose,
      allowPause: editAllowPause,
      allowRenew: editAllowRenew,
      description: editDescription,
    });

    setIsEditPlanOpen(false);
    setEditingPlan(null);
  };

  const openDeleteModal = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    deletePlan(planToDelete.id);
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={32} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Subscription Plans & Policies
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Admin Policy
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Configure billing frequencies (Daily, Weekly, Monthly, Yearly) and strict lifecycle automation rules.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsNewPlanOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Configure New Plan</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Only Admin Can Edit Plans</span>
          </div>
        )}
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Top: Code, Frequency, and Admin Actions */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                  {plan.code}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F4ECE1] text-[#7A4B20] border border-[#E5D7C5]">
                    {plan.frequency}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1 hover:bg-[#F3EBE0] text-[#7A4B20] rounded-md transition-colors"
                        title="Edit plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(plan)}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{plan.description}</p>

              <div className="p-3 bg-[#FAF7F2] rounded-xl mb-4 border border-[#EAE2D5]">
                <div className="text-[10px] text-[#7A6D61] font-semibold uppercase">Pricing Baseline</div>
                <div className="text-2xl font-bold text-[#2C2621]">
                  {formatCurrency(plan.price)}
                  <span className="text-xs font-normal text-[#7A6D61]"> / {plan.frequency.toLowerCase()}</span>
                </div>
                <div className="text-[11px] text-[#7A6D61] mt-1">Min Seats: {plan.minQuantity}</div>
              </div>

              {/* Lifecycle Policy Matrix */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lifecycle Rules
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auto-Close at End:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        plan.autoCloseOnEnd ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {plan.autoCloseOnEnd ? 'Yes (Auto-Closes)' : 'No'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Early Termination:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        plan.allowEarlyClose ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {plan.allowEarlyClose ? 'Allowed' : 'Locked'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pause Subscription:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        plan.allowPause ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {plan.allowPause ? 'Allowed' : 'Disallowed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Renewable:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        plan.allowRenew ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {plan.allowRenew ? 'Allowed' : 'Single Run'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Active since {formatDate(plan.startDate)}
            </div>
          </div>
        ))}
      </div>

      {/* New Plan Modal */}
      {isNewPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Define Subscription Plan</h3>
                <p className="text-xs text-[#7A6D61]">Configure frequency and lifecycle automation</p>
              </div>
              <button onClick={() => setIsNewPlanOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarterly Pro Tier"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Plan Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="PLAN-Q-PRO"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-mono uppercase focus:outline-none focus:border-[#C29367]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Billing Frequency *</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as BillingFrequency)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl bg-white focus:outline-none focus:border-[#C29367]"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Recurring Price ($) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-bold focus:outline-none focus:border-[#C29367]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Minimum Seats</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                  />
                </div>
              </div>

              {/* Lifecycle Policy Checkboxes */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl space-y-2">
                <div className="font-semibold text-[#2C2621] mb-1">Lifecycle Policies</div>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={autoCloseOnEnd}
                    onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Auto-close on end date (do not auto-renew)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={allowEarlyClose}
                    onChange={(e) => setAllowEarlyClose(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow early termination / cancellation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={allowPause}
                    onChange={(e) => setAllowPause(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow pausing subscription</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={allowRenew}
                    onChange={(e) => setAllowRenew(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow renewal</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target customer profile and included services..."
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
                <button
                  type="button"
                  onClick={() => setIsNewPlanOpen(false)}
                  className="px-4 py-2 border border-[#E5D7C5] rounded-xl text-[#5A4D42] font-semibold hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditPlanOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Edit Subscription Plan</h3>
                <p className="text-xs text-[#7A6D61]">Modify frequency and lifecycle policies</p>
              </div>
              <button onClick={() => setIsEditPlanOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Plan Code *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-mono uppercase focus:outline-none focus:border-[#C29367]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Billing Frequency *</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value as BillingFrequency)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl bg-white focus:outline-none focus:border-[#C29367]"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Recurring Price ($) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-bold focus:outline-none focus:border-[#C29367]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C2621] mb-1">Minimum Seats</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editMinQuantity}
                    onChange={(e) => setEditMinQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                  />
                </div>
              </div>

              {/* Lifecycle Policy Checkboxes */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl space-y-2">
                <div className="font-semibold text-[#2C2621] mb-1">Lifecycle Policies</div>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={editAutoCloseOnEnd}
                    onChange={(e) => setEditAutoCloseOnEnd(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Auto-close on end date (do not auto-renew)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={editAllowEarlyClose}
                    onChange={(e) => setEditAllowEarlyClose(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow early termination / cancellation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={editAllowPause}
                    onChange={(e) => setEditAllowPause(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow pausing subscription</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#4A3C30]">
                  <input
                    type="checkbox"
                    checked={editAllowRenew}
                    onChange={(e) => setEditAllowRenew(e.target.checked)}
                    className="rounded text-[#B88457] focus:ring-[#B88457]"
                  />
                  <span>Allow renewal</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Target customer profile and included services..."
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
                <button
                  type="button"
                  onClick={() => setIsEditPlanOpen(false)}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Subscription Plan?</h3>
                <p className="text-xs text-slate-500">This policy configuration will be removed</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{planToDelete.name}</span> ({planToDelete.code})? Existing active subscriptions under this plan will remain valid.
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
