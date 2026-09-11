"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

export function LeadStatusForm({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/nextjs-app/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update lead status.");
      setStatus(currentStatus); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-neutral-400">Current Status:</span>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        className="px-4 py-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-sm font-bold text-white focus:outline-none focus:border-gold-500 transition-colors cursor-pointer disabled:opacity-50"
      >
        <option value="NEW">NEW</option>
        <option value="CONTACTED">CONTACTED</option>
        <option value="IN_PROGRESS">IN PROGRESS</option>
        <option value="CLOSED">CLOSED</option>
      </select>
      {isUpdating && <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />}
    </div>
  );
}
