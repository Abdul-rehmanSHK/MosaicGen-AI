"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Clock, CheckCircle2, User, PhoneCall } from "lucide-react";

interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date | string;
  product?: { title: string; sampleImageUrl: string } | null;
  generation?: { prompt: string; resultImageUrl: string } | null;
}

export function InquiriesManagerClient({ initialInquiries }: { initialInquiries: InquiryRecord[] }) {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(initialInquiries);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Client Name & Email</th>
                <th className="p-4">Project Message</th>
                <th className="p-4">Attached Spec</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Lead Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-obsidian-800/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{inq.name}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">{inq.email}</span>
                  </td>
                  <td className="p-4 text-neutral-300 max-w-xs italic">"{inq.message}"</td>
                  <td className="p-4">
                    {inq.generation ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded border border-neutral-700 overflow-hidden">
                          <Image src={inq.generation.resultImageUrl} alt="Gen" fill className="object-cover" />
                        </div>
                        <span className="text-[10px] text-gold-300 font-mono truncate max-w-[120px]">
                          AI Render Design
                        </span>
                      </div>
                    ) : inq.product ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded border border-neutral-700 overflow-hidden">
                          <Image src={inq.product.sampleImageUrl} alt="Prod" fill className="object-cover" />
                        </div>
                        <span className="text-[10px] text-gold-300 font-mono truncate max-w-[120px]">
                          {inq.product.title}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-500">General Inquiry</span>
                    )}
                  </td>
                  <td className="p-4 text-neutral-400">{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
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
