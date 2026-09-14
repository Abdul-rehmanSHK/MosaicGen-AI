"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FileEdit, 
  Sparkles, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  Edit3, 
  X, 
  Key, 
  User, 
  Loader2, 
  Save 
} from "lucide-react";

interface UserRecord {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  createdAt: Date | string;
  _count?: {
    generations: number;
    leads: number;
  };
}

export function UsersManagerClient({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "CONTENT_EDITOR">("CONTENT_EDITOR");
  const [editPassword, setEditPassword] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditRole((user.role === "ADMIN" ? "ADMIN" : "CONTENT_EDITOR"));
    setEditPassword("");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditPassword("");
    setEditError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const payload: any = {
        userId: editingUser.id,
        name: editName,
        email: editEmail,
        role: editRole,
      };

      if (editPassword.trim().length > 0) {
        if (editPassword.trim().length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        payload.newPassword = editPassword.trim();
      }

      const res = await fetch("/api/nextjs-app/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user account");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: editName, email: editEmail, role: editRole }
            : u
        )
      );

      setSuccessMessage(`Account & role for ${editEmail} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3500);
      closeEditModal();
    } catch (err: any) {
      setEditError(err.message || "Failed to update account.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "CONTENT_EDITOR") => {
    setUpdatingId(userId);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/nextjs-app/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed role update");
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSuccessMessage(`Updated role to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 2 Roles Definition Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gold-300 font-mono uppercase tracking-wider">Role 1: ADMIN</span>
            <span className="text-xs text-white font-semibold mt-0.5">Complete Studio Administration</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Full access to everything: Dashboard & Analytics, Products Catalog, Media Library, AI Generations, Pages CMS, Aesthetic Finder CMS, Users & Roles, and Client Inquiries.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-amber-500/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <FileEdit className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">Role 2: CONTENT_EDITOR</span>
            <span className="text-xs text-white font-semibold mt-0.5">Content & Design Editing Only</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Can see and edit content only: Pages Content CMS, Aesthetic Finder CMS, Media Library, and Products Catalog. Restricted from user administration, financial analytics, and client inquiries.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">User Name & Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Studio Activity</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions & Role Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((user) => {
                const isAdmin = user.role === "ADMIN";

                return (
                  <tr key={user.id} className="hover:bg-obsidian-800/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isAdmin
                          ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{user.name || "Studio Member"}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 w-fit ${
                          isAdmin
                            ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-md shadow-gold-500/10 font-bold"
                            : "bg-obsidian-800 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isAdmin ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> ADMIN (Full Access)
                          </>
                        ) : (
                          <>
                            <FileEdit className="w-3.5 h-3.5 text-amber-400" /> CONTENT_EDITOR (Content Only)
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-[11px]">
                      <div className="flex gap-3 text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold-400" /> {user._count?.generations || 0} renders
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gold-400" /> {user._count?.leads || 0} leads
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-300 border border-neutral-700 hover:border-gold-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Edit user profile, role, or reset password"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                          <span>Edit Role</span>
                        </button>

                        <select
                          value={user.role === "ADMIN" ? "ADMIN" : "CONTENT_EDITOR"}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "CONTENT_EDITOR")}
                          className="p-1.5 rounded-lg bg-obsidian-950 border border-gold-500/30 text-xs text-gold-300 font-bold focus:outline-none focus:border-gold-400 cursor-pointer disabled:opacity-50"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="CONTENT_EDITOR">CONTENT_EDITOR</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User & Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative">
            <button
              type="button"
              onClick={closeEditModal}
              className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Edit User Profile & Role</h3>
                <p className="text-xs text-neutral-400">
                  Update account credentials, administrative permissions, and password.
                </p>
              </div>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Aurelia Vance"
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@mosaic.com"
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> Assigned Studio Role (2 Roles Strictly)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole("ADMIN")}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      editRole === "ADMIN"
                        ? "bg-gold-500/15 border-gold-400 text-gold-300 ring-2 ring-gold-500/30"
                        : "bg-obsidian-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1 text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> ADMIN
                    </span>
                    <span className="text-[10px] text-neutral-400">Complete studio admin access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole("CONTENT_EDITOR")}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      editRole === "CONTENT_EDITOR"
                        ? "bg-amber-500/15 border-amber-400 text-amber-300 ring-2 ring-amber-500/30"
                        : "bg-obsidian-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1 text-white">
                      <FileEdit className="w-3.5 h-3.5 text-amber-400" /> CONTENT_EDITOR
                    </span>
                    <span className="text-[10px] text-neutral-400">Content and catalog editing only</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-400" /> Reset Password (Optional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave empty to retain current password"
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold-400 font-mono"
                />
                <span className="text-[10px] text-neutral-500">
                  Minimum 6 characters. If entered, user will log in with this new password.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800 mt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  {isSubmittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
