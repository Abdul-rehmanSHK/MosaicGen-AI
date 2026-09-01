"use client";

import React, { useState } from "react";
import { Activity, Trash2, Search, Filter, ShieldCheck, Sparkles, Package, FileText, Mail, User } from "lucide-react";

interface AuditLogRecord {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  details: string;
  createdAt: Date | string;
}

export function LogsManagerClient({ initialLogs }: { initialLogs: AuditLogRecord[] }) {
  const [logs, setLogs] = useState<AuditLogRecord[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("All");

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === "All" || log.action === selectedAction;
    const matchesSearch =
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all audit logs?")) return;

    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear logs");
      setLogs([]);
    } catch (e) {
      alert("Failed to clear logs.");
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("AI_GENERATION")) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/20 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
          <Sparkles className="w-3 h-3 text-gold-400" /> {action}
        </span>
      );
    }
    if (action.includes("PRODUCT")) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
          <Package className="w-3 h-3 text-purple-400" /> {action}
        </span>
      );
    }
    if (action.includes("PAGE")) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
          <FileText className="w-3 h-3 text-blue-400" /> {action}
        </span>
      );
    }
    if (action.includes("INQUIRY")) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
          <Mail className="w-3 h-3 text-emerald-400" /> {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
        <Activity className="w-3 h-3 text-neutral-400" /> {action}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gold-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log activity, user email, or payload..."
            className="w-full p-2 bg-transparent text-xs text-white focus:outline-none placeholder-neutral-500"
          />
        </div>

        <button
          type="button"
          onClick={handleClearLogs}
          className="px-4 py-2 rounded-xl bg-obsidian-950 hover:bg-red-950/40 text-red-400 border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Audit Logs
        </button>
      </div>

      {/* Audit Logs Stream Table */}
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor / Email</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Event Payload & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-400">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-obsidian-800/50 transition-colors">
                    <td className="p-4 text-neutral-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-white">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gold-400" />
                        {log.userEmail || "Guest Visitor"}
                      </span>
                    </td>
                    <td className="p-4">{getActionBadge(log.action)}</td>
                    <td className="p-4 text-[11px] text-neutral-300 max-w-md font-mono line-clamp-2">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
