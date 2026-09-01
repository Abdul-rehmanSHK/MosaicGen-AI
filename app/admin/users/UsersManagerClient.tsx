"use client";

import React, { useState } from "react";
import { ShieldCheck, User as UserIcon, Calendar, Sparkles, Mail, Check } from "lucide-react";

interface UserRecord {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  createdAt: Date | string;
  _count?: {
    generations: number;
    inquiries: number;
  };
}

export function UsersManagerClient({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error("Failed role update");
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (e) {
      alert("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
            <tr>
              <th className="p-4">User Name & Email</th>
              <th className="p-4">RBAC Role</th>
              <th className="p-4">Studio Activity</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Role Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-obsidian-800/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center font-bold">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{user.name || "Anonymous User"}</span>
                    <span className="text-[11px] text-neutral-400">{user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 w-fit ${
                      user.role === "ADMIN"
                        ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/10"
                        : "bg-obsidian-800 text-neutral-300 border border-neutral-700"
                    }`}
                  >
                    {user.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-[11px]">
                  <div className="flex gap-3 text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold-400" /> {user._count?.generations || 0} renders
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gold-400" /> {user._count?.inquiries || 0} leads
                    </span>
                  </div>
                </td>
                <td className="p-4 text-neutral-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <select
                    value={user.role}
                    disabled={updatingId === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "USER")}
                    className="p-1.5 rounded-lg bg-obsidian-950 border border-neutral-800 text-xs text-gold-300 font-bold focus:outline-none focus:border-gold-400"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
