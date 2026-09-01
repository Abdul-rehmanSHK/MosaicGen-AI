"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Clock, CheckCircle2, User, PhoneCall, Trash2, Tag, Eye } from "lucide-react";

interface InquiryRecord {
  id: string;
  inquiryType: string;
  name: string;
  email: string;
  phone?: string | null;
  preferredTime?: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
  product?: { title: string; sampleImageUrl: string } | null;
  generation?: { prompt: string; resultImageUrl: string } | null;
}

export function InquiriesManagerClient({ initialInquiries }: { initialInquiries: InquiryRecord[] }) {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(initialInquiries);
  const [inspectInquiry, setInspectInquiry] = useState<InquiryRecord | null>(null);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");
      setInquiries(inquiries.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i)));
    } catch (e) {
      alert("Failed to update inquiry status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead inquiry from the database?")) return;

    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setInquiries(inquiries.filter((i) => i.id !== id));
      if (inspectInquiry?.id === id) setInspectInquiry(null);
    } catch (e) {
      alert("Failed to delete inquiry.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-neutral-400">
          Total Stored Lead Queries: {inquiries.length}
        </span>
      </div>

      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Lead Type</th>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Message / Preferred Time</th>
                <th className="p-4">Attached AI Design</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    No client lead queries recorded yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-obsidian-800/50 transition-colors">
                    <td className="p-4">
                      {inq.inquiryType === "TALK_TO_SPECIALIST" ? (
                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold flex items-center gap-1.5 w-fit">
                          <PhoneCall className="w-3 h-3 text-blue-400" /> Specialist Call
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/30 font-mono text-[10px] font-bold flex items-center gap-1.5 w-fit">
                          <Mail className="w-3 h-3 text-gold-400" /> Sample Quote
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white block">{inq.name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono block">{inq.email}</span>
                      {inq.phone && (
                        <span className="text-[10px] text-gold-400 font-mono flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-3 h-3" /> {inq.phone}
                        </span>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="text-neutral-300 line-clamp-2 italic">"{inq.message}"</p>
                      {inq.preferredTime && (
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          ⏰ Preferred: {inq.preferredTime}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {inq.generation ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-9 h-9 rounded-lg border border-neutral-700 overflow-hidden flex-shrink-0">
                            <Image src={inq.generation.resultImageUrl} alt="Gen" fill className="object-cover" />
                          </div>
                          <span className="text-[10px] text-gold-300 font-mono truncate max-w-[120px]">
                            AI Render Design
                          </span>
                        </div>
                      ) : inq.product ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-9 h-9 rounded-lg border border-neutral-700 overflow-hidden flex-shrink-0">
                            <Image src={inq.product.sampleImageUrl} alt="Prod" fill className="object-cover" />
                          </div>
                          <span className="text-[10px] text-gold-300 font-mono truncate max-w-[120px]">
                            {inq.product.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-500">General Consultation</span>
                      )}
                    </td>

                    <td className="p-4 text-neutral-400 font-mono whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`p-1.5 rounded-lg border text-xs font-bold focus:outline-none ${
                            inq.status === "PENDING"
                              ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
                              : inq.status === "CONTACTED"
                              ? "bg-blue-950/40 text-blue-300 border-blue-500/30"
                              : "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDelete(inq.id)}
                          className="p-1.5 rounded-lg bg-obsidian-950 hover:bg-red-950/40 text-red-400 transition-colors"
                          title="Delete Lead Query"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
