"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Shield, User, Mail, ShieldAlert, Edit2, Key, Check } from "lucide-react";

export function TeamClient({ initialUsers, isSuperAdmin, currentUserId }: { initialUsers: any[], isSuperAdmin: boolean, currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);

  // In a real implementation, these would open modals with forms triggering server actions/APIs.
  // For the scope of this implementation, we will display the table and structural UI.

  return (
    <div className="flex flex-col gap-6">
      {isSuperAdmin && (
        <div className="flex justify-end">
          <button className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20">
            <User className="w-4 h-4" /> Add Team Member
          </button>
        </div>
      )}

      <div className="bg-obsidian-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider text-xs border-b border-neutral-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role & Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-obsidian-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white flex items-center gap-2">
                        {u.name || "Unnamed"}
                        {u.id === currentUserId && (
                          <span className="px-1.5 py-0.5 rounded bg-obsidian-800 text-[9px] text-neutral-400 uppercase tracking-widest border border-neutral-700">You</span>
                        )}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                        <Mail className="w-3 h-3 text-gold-400" /> {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                        u.role === "SUPER_ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                        u.role === "ADMIN" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        u.role === "CONTENT_EDITOR" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                        "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}>
                        {u.role === "SUPER_ADMIN" && <ShieldAlert className="w-3 h-3" />}
                        {u.role === "ADMIN" && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                      {u.isVerified ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono text-neutral-400">
                    {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-obsidian-800 hover:bg-neutral-700 text-neutral-300 transition-colors" title="Edit Profile">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-obsidian-800 hover:bg-neutral-700 text-neutral-300 transition-colors" title="Change Password">
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
