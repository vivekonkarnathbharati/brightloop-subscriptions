'use client';

import React, { useState } from 'react';
import { useBrightloop } from '@/lib/store';
import { Role, User } from '@/lib/types';
import { BrightloopLogo } from '@/components/ui/BrightloopLogo';
import { UserPlus, Lock, Edit2, Trash2, Shield, AlertTriangle } from 'lucide-react';

export function StaffView() {
  const { users, currentUser, isAdmin, addStaffMember, updateStaffMember, deleteStaffMember } = useBrightloop();
  
  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('STAFF');

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);

  // Staff and Admin members
  const internalTeam = users.filter((u) => u.role === 'ADMIN' || u.role === 'STAFF');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !name || !email) return;

    const res = addStaffMember(name, email);
    if (res.success) {
      setIsModalOpen(false);
      setName('');
      setEmail('');
    }
  };

  const openEditModal = (member: User) => {
    setEditingStaff(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingStaff || !editName || !editEmail) return;

    const res = updateStaffMember(editingStaff.id, {
      name: editName,
      email: editEmail,
      role: editRole,
    });

    if (res.success) {
      setIsEditModalOpen(false);
      setEditingStaff(null);
    }
  };

  const openDeleteModal = (member: User) => {
    setStaffToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!isAdmin || !staffToDelete) return;
    deleteStaffMember(staffToDelete.id);
    setIsDeleteModalOpen(false);
    setStaffToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <BrightloopLogo size={32} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621] flex items-center gap-2">
              Internal Staff & Access Roster
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F5EDE1] text-[#7A4B20] border border-[#E5D7C5]">
                Admin Controlled
              </span>
            </h1>
            <p className="text-xs text-[#7A6D61] mt-0.5">
              Manage sales reps, operators, and platform administrators with granular role controls.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C29367] to-[#B88457] hover:from-[#B88457] hover:to-[#A76D3B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C29367]/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New Staff Member</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Only Admin Can Manage Staff Members</span>
          </div>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] border-b border-[#EAE2D5] text-[#5A4D42] font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role & Permissions</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Status</th>
              {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {internalTeam.map((member) => {
              const isSelf = member.id === currentUser?.id;
              return (
                <tr key={member.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C29367] to-[#B88457] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {member.name}
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#F3EBE0] text-[#7A4B20] font-bold rounded">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{member.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        member.role === 'ADMIN'
                          ? 'bg-[#F4ECE1] text-[#7A4B20] border border-[#E5D7C5]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{member.companyName || 'Brightloop Internal'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 hover:bg-[#F3EBE0] text-[#7A4B20] rounded-lg transition-colors"
                          title="Edit staff details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(member)}
                          disabled={isSelf}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelf
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'hover:bg-rose-50 text-rose-600'
                          }`}
                          title={isSelf ? 'Cannot delete current account' : 'Remove staff member'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Invite Staff Member</h3>
                <p className="text-xs text-[#7A6D61]">Provision a new internal team account</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-mono focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE2D5] text-[11px] text-[#5A4D42]">
                Staff members have full access to manage customers, quotations, and active subscriptions, but are restricted from configuring statutory taxes and discount policies.
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE2D5] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Edit Staff Member</h3>
                <p className="text-xs text-[#7A6D61]">Update roster permissions and credentials</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl font-mono focus:outline-none focus:border-[#C29367]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2621] mb-1">Assigned Role *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full p-2.5 border border-[#E5D7C5] rounded-xl bg-white focus:outline-none focus:border-[#C29367]"
                >
                  <option value="STAFF">STAFF (Operator / Quotes / Subscriptions)</option>
                  <option value="ADMIN">ADMIN (Full Access / Rules / Taxes / Roster)</option>
                </select>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Staff Member?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{staffToDelete.name}</span> ({staffToDelete.email}) from the staff roster? They will lose access to Brightloop immediately.
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
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
