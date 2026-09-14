"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Package,
  Layers,
  Ruler,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Eye,
  DollarSign,
  MessageSquare,
  Filter,
} from "lucide-react";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  spaceType: string;
  roomDimensions?: string | null;
  designImageUrl?: string | null;
  message: string;
  status: string;
  adminNotes?: string | null;
  quoteAmount?: number | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  product?: {
    id: string;
    title: string;
    sampleImageUrl: string;
    category?: string;
    pricePerSqFt?: number;
  } | null;
  generation?: {
    id: string;
    prompt: string;
    placement?: string;
    resultImageUrl: string;
  } | null;
}

interface ProductOption {
  id: string;
  title: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "NEW / PENDING", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { value: "CONTACTED", label: "CONTACTED", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { value: "IN_PROGRESS", label: "IN PROGRESS", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { value: "COMPLETED", label: "COMPLETED", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { value: "CLOSED", label: "CLOSED / ARCHIVED", color: "bg-neutral-800 text-neutral-400 border-neutral-700" },
];

const SPACE_PRESETS = [
  "Entryway / Foyer",
  "Living Room",
  "Grand Rotunda",
  "Luxury Bathroom",
  "Pool & Spa",
  "Commercial Lobby",
  "Feature Accent Wall",
  "Bespoke Surface",
];

export function InquiriesManagerClient({
  initialInquiries,
  availableProducts = [],
}: {
  initialInquiries: InquiryRecord[];
  availableProducts?: ProductOption[];
}) {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingInquiry, setEditingInquiry] = useState<InquiryRecord | null>(null);
  const [viewingInquiry, setViewingInquiry] = useState<InquiryRecord | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectInquiry = (id: string) => {
    setSelectedInquiryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllInquiries = (items: InquiryRecord[]) => {
    const itemIds = items.map((i) => i.id);
    const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedInquiryIds.includes(id));
    if (allSelected) {
      setSelectedInquiryIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedInquiryIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  // Bulk Delete Inquiries
  const handleBulkDeleteInquiries = async () => {
    if (selectedInquiryIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedInquiryIds.length} inquiries? This cannot be undone.`
      )
    ) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/nextjs-app/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedInquiryIds }),
      });
      if (!res.ok) throw new Error("Failed to delete selected inquiries");
      setInquiries((prev) => prev.filter((i) => !selectedInquiryIds.includes(i.id)));
      showToast(`${selectedInquiryIds.length} inquiries deleted from database.`);
      setSelectedInquiryIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // New inquiry form state
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    phone: "",
    spaceType: "Entryway / Foyer",
    roomDimensions: "",
    message: "",
    status: "NEW",
    adminNotes: "",
    quoteAmount: "",
    productId: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status counter calculations
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: inquiries.length };
    STATUS_OPTIONS.forEach((s) => (counts[s.value] = 0));
    inquiries.forEach((inq) => {
      const s = inq.status || "NEW";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [inquiries]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === "ALL" || inq.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.phone && inq.phone.toLowerCase().includes(q)) ||
        inq.spaceType.toLowerCase().includes(q) ||
        (inq.roomDimensions && inq.roomDimensions.toLowerCase().includes(q)) ||
        inq.message.toLowerCase().includes(q) ||
        (inq.adminNotes && inq.adminNotes.toLowerCase().includes(q)) ||
        (inq.product?.title && inq.product.title.toLowerCase().includes(q))
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Handle Quick Status Change
  const handleQuickStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/nextjs-app/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i)));
      showToast(`Lead status updated to ${newStatus}`);
    } catch (e: any) {
      alert(e.message || "Failed to update inquiry status.");
    }
  };

  // Handle Full Edit Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/nextjs-app/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: editingInquiry.id,
          name: editingInquiry.name,
          email: editingInquiry.email,
          phone: editingInquiry.phone,
          spaceType: editingInquiry.spaceType,
          roomDimensions: editingInquiry.roomDimensions,
          message: editingInquiry.message,
          status: editingInquiry.status,
          adminNotes: editingInquiry.adminNotes,
          quoteAmount: editingInquiry.quoteAmount,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes.");
      const data = await res.json();
      setInquiries((prev) => prev.map((i) => (i.id === editingInquiry.id ? data.inquiry : i)));
      setEditingInquiry(null);
      showToast("Inquiry details updated successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to save inquiry modifications.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Create New Inquiry
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/nextjs-app/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create inquiry.");
      }

      const data = await res.json();
      setInquiries((prev) => [data.inquiry, ...prev]);
      setIsNewModalOpen(false);
      setNewForm({
        name: "",
        email: "",
        phone: "",
        spaceType: "Entryway / Foyer",
        roomDimensions: "",
        message: "",
        status: "NEW",
        adminNotes: "",
        quoteAmount: "",
        productId: "",
      });
      showToast("New client inquiry logged successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to create inquiry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/nextjs-app/inquiries?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setDeletingId(null);
      if (editingInquiry?.id === id) setEditingInquiry(null);
      if (viewingInquiry?.id === id) setViewingInquiry(null);
      showToast("Inquiry deleted from database.");
    } catch (e: any) {
      alert(e.message || "Failed to delete inquiry.");
    }
  };

  // Copy inquiry formatted brief to clipboard
  const handleCopyBrief = (inq: InquiryRecord) => {
    const brief = `=== MEC AI MOSAIC - CLIENT INQUIRY ===
Client Name: ${inq.name}
Email: ${inq.email}
Phone: ${inq.phone || "Not provided"}
Space / Surface: ${inq.spaceType}
Dimensions: ${inq.roomDimensions || "Not specified"}
Status: ${inq.status}
Quote Amount: ${inq.quoteAmount ? `$${inq.quoteAmount.toFixed(2)}` : "Not estimated"}
Submission Date: ${new Date(inq.createdAt).toLocaleString()}
Attached Product: ${inq.product?.title || "None"}
Attached AI Render: ${inq.generation?.prompt || "None"}

Project Message:
${inq.message}

Admin Internal Notes:
${inq.adminNotes || "None"}
======================================`;

    navigator.clipboard.writeText(brief);
    setCopiedId(inq.id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast("Formatted client inquiry copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-gold-500 text-obsidian-950 font-bold text-xs shadow-2xl flex items-center gap-3 border border-gold-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-obsidian-950" />
          {toastMessage}
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Inquiries</span>
          <span className="text-2xl font-serif font-bold text-white">{inquiries.length}</span>
          <span className="text-[11px] text-gold-400">All client quote requests</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-amber-500/20 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">New / Pending</span>
          <span className="text-2xl font-serif font-bold text-amber-400">{statusCounts["NEW"] || 0}</span>
          <span className="text-[11px] text-neutral-400">Awaiting consultation</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-purple-500/20 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">In Progress</span>
          <span className="text-2xl font-serif font-bold text-purple-400">
            {(statusCounts["CONTACTED"] || 0) + (statusCounts["IN_PROGRESS"] || 0)}
          </span>
          <span className="text-[11px] text-neutral-400">Quotes & sample chip boxes</span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-emerald-500/20 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Completed</span>
          <span className="text-2xl font-serif font-bold text-emerald-400">{statusCounts["COMPLETED"] || 0}</span>
          <span className="text-[11px] text-neutral-400">Dispatched or fulfilled</span>
        </div>
      </div>

      {/* Action Bar: Search, Status Filter & Add Inquiry */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900 border border-neutral-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, space, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Status Filter Tabs & Log Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-obsidian-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-gold-500 text-obsidian-950 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All ({inquiries.length})
            </button>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === opt.value
                    ? "bg-gold-500 text-obsidian-950 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {opt.label.split("/")[0].trim()} ({statusCounts[opt.value] || 0})
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Log Inquiry
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedInquiryIds.length > 0 && (
        <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 font-mono font-bold text-xs flex items-center justify-center">
              {selectedInquiryIds.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedInquiryIds.length} {selectedInquiryIds.length === 1 ? "inquiry" : "inquiries"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedInquiryIds([])}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={handleBulkDeleteInquiries}
              className="px-4 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected Inquiries
            </button>
          </div>
        </div>
      )}

      {/* Full Inquiries Table with Comprehensive Form Data */}
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredInquiries.length > 0 && filteredInquiries.every((i) => selectedInquiryIds.includes(i.id))}
                    onChange={() => handleSelectAllInquiries(filteredInquiries)}
                    className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                  />
                </th>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Space & Scope</th>
                <th className="p-4">Project Message & Notes</th>
                <th className="p-4">Attached Spec</th>
                <th className="p-4">Status & Quote</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                    No client inquiries match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => {
                  const statusObj = STATUS_OPTIONS.find((s) => s.value === inq.status) || STATUS_OPTIONS[0];
                  const isSelected = selectedInquiryIds.includes(inq.id);

                  return (
                    <tr key={inq.id} className={`hover:bg-obsidian-800/40 transition-colors group ${isSelected ? "bg-gold-500/5" : ""}`}>
                      <td className="p-4 w-10 text-center align-top pt-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectInquiry(inq.id)}
                          className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                        />
                      </td>
                      {/* 1. Client Contact Info */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white text-sm">{inq.name}</span>
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-neutral-400 hover:text-gold-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Mail className="w-3 h-3 text-gold-400" /> {inq.email}
                          </a>
                          {inq.phone ? (
                            <a
                              href={`tel:${inq.phone}`}
                              className="text-neutral-400 hover:text-gold-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-gold-400" /> {inq.phone}
                            </a>
                          ) : (
                            <span className="text-[10px] text-neutral-600 italic">No phone provided</span>
                          )}
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-neutral-600" />
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* 2. Space & Dimensions Scope */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/20 font-mono text-[11px] font-semibold w-fit flex items-center gap-1">
                            <Layers className="w-3 h-3 text-gold-400" /> {inq.spaceType}
                          </span>
                          {inq.roomDimensions ? (
                            <span className="text-white font-mono text-[11px] flex items-center gap-1">
                              <Ruler className="w-3 h-3 text-gold-400" /> {inq.roomDimensions}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-600 italic">Custom dimensions</span>
                          )}
                          {inq.quoteAmount && (
                            <span className="text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Quote: ${inq.quoteAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Project Message & Admin Notes */}
                      <td className="p-4 align-top max-w-xs">
                        <div className="flex flex-col gap-2">
                          <p className="text-neutral-300 text-xs italic line-clamp-3">"{inq.message}"</p>
                          {inq.adminNotes && (
                            <div className="p-2 rounded-lg bg-obsidian-950 border border-gold-500/20 text-[11px] text-gold-300/90 flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                <strong className="text-gold-300">Admin Note:</strong> {inq.adminNotes}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Attached Spec / Render / Mockup */}
                      <td className="p-4 align-top">
                        {inq.generation ? (
                          <div
                            onClick={() => setViewingInquiry(inq)}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-obsidian-950 border border-gold-500/20 cursor-pointer hover:border-gold-400 transition-all"
                            title="Click to view full generation details"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                              <Image
                                src={inq.generation.resultImageUrl}
                                alt="AI Render"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[130px]">
                              <span className="text-[10px] font-mono text-gold-400 font-bold uppercase truncate">
                                {inq.generation.placement || "AI Mosaic"}
                              </span>
                              <span className="text-[11px] text-neutral-300 truncate">{inq.generation.prompt}</span>
                            </div>
                          </div>
                        ) : inq.product ? (
                          <div
                            onClick={() => setViewingInquiry(inq)}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-obsidian-950 border border-neutral-800 cursor-pointer hover:border-gold-400 transition-all"
                            title="Click to view catalog product"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                              <Image
                                src={inq.product.sampleImageUrl}
                                alt={inq.product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[130px]">
                              <span className="text-[10px] font-mono text-neutral-400 truncate">Catalog Sample</span>
                              <span className="text-[11px] text-white font-semibold truncate">{inq.product.title}</span>
                              {inq.product.pricePerSqFt && (
                                <span className="text-[10px] text-gold-400 font-mono">
                                  ${inq.product.pricePerSqFt}/sq.ft
                                </span>
                              )}
                            </div>
                          </div>
                        ) : inq.designImageUrl ? (
                          <a
                            href={inq.designImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-xl bg-obsidian-950 border border-neutral-800 text-gold-400 hover:text-gold-300 text-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Custom Mockup
                          </a>
                        ) : (
                          <span className="text-[11px] text-neutral-500 italic">No design attached</span>
                        )}
                      </td>

                      {/* 5. Status Selector */}
                      <td className="p-4 align-top">
                        <select
                          value={inq.status}
                          onChange={(e) => handleQuickStatusChange(inq.id, e.target.value)}
                          className={`p-2 rounded-xl border text-xs font-bold font-mono focus:outline-none cursor-pointer ${statusObj.color}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-obsidian-950 text-white font-sans">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 6. Action Controls */}
                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick View Button */}
                          <button
                            onClick={() => setViewingInquiry(inq)}
                            className="p-2 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 text-neutral-300 hover:text-gold-400 border border-neutral-800 transition-all"
                            title="View Full Inquiry Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Full Edit Button */}
                          <button
                            onClick={() => setEditingInquiry(inq)}
                            className="p-2 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 text-neutral-300 hover:text-gold-400 border border-neutral-800 transition-all"
                            title="Modify All Form Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Brief Button */}
                          <button
                            onClick={() => handleCopyBrief(inq)}
                            className="p-2 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 text-neutral-300 hover:text-emerald-400 border border-neutral-800 transition-all"
                            title="Copy Formatted Brief"
                          >
                            {copiedId === inq.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingId(inq.id)}
                            className="p-2 rounded-lg bg-obsidian-950 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-all"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FULL DETAIL VIEW MODAL */}
      {/* ========================================================================= */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-obsidian-900 border border-gold-500/30 p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400">
                  Client Quote & Sample Request
                </span>
                <h2 className="text-xl font-serif font-bold text-white">{viewingInquiry.name}</h2>
              </div>
              <button
                onClick={() => setViewingInquiry(null)}
                className="p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Email Address</span>
                <a href={`mailto:${viewingInquiry.email}`} className="text-xs text-gold-300 font-bold hover:underline">
                  {viewingInquiry.email}
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Phone Number</span>
                <span className="text-xs text-white font-mono">{viewingInquiry.phone || "Not provided"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Space / Surface Type</span>
                <span className="text-xs text-gold-400 font-bold">{viewingInquiry.spaceType}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Room Dimensions / Size</span>
                <span className="text-xs text-white font-mono">{viewingInquiry.roomDimensions || "Not specified"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Lead Lifecycle Status</span>
                <span className="text-xs text-white font-bold font-mono">{viewingInquiry.status}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Estimated Quote Amount</span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {viewingInquiry.quoteAmount ? `$${viewingInquiry.quoteAmount.toFixed(2)}` : "Pending estimation"}
                </span>
              </div>
            </div>

            {/* Message Box */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Full Project Message
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed italic whitespace-pre-wrap">
                "{viewingInquiry.message}"
              </p>
            </div>

            {/* Admin Notes */}
            {viewingInquiry.adminNotes && (
              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Internal Studio Admin Notes
                </span>
                <p className="text-xs text-gold-200 whitespace-pre-wrap">{viewingInquiry.adminNotes}</p>
              </div>
            )}

            {/* Attached Image Spec */}
            {(viewingInquiry.generation || viewingInquiry.product || viewingInquiry.designImageUrl) && (
              <div className="p-4 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">
                  Attached Mosaic Design Reference
                </span>
                {viewingInquiry.generation && (
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gold-500/30 shrink-0">
                      <Image
                        src={viewingInquiry.generation.resultImageUrl}
                        alt="Render"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white">{viewingInquiry.generation.placement}</span>
                      <p className="text-xs text-neutral-400 leading-relaxed">{viewingInquiry.generation.prompt}</p>
                    </div>
                  </div>
                )}
                {viewingInquiry.product && (
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                      <Image
                        src={viewingInquiry.product.sampleImageUrl}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white">{viewingInquiry.product.title}</span>
                      <span className="text-xs text-gold-400 font-mono">
                        ${viewingInquiry.product.pricePerSqFt}/sq.ft
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => handleCopyBrief(viewingInquiry)}
                className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Brief
              </button>
              <button
                onClick={() => {
                  setEditingInquiry(viewingInquiry);
                  setViewingInquiry(null);
                }}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Form Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COMPREHENSIVE EDIT MODAL ("Modify this in more way") */}
      {/* ========================================================================= */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-obsidian-900 border border-gold-500/30 p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400">
                  Modify Inquiry & Lead Record
                </span>
                <h2 className="text-xl font-serif font-bold text-white">Edit Client Form Details</h2>
              </div>
              <button
                onClick={() => setEditingInquiry(null)}
                className="p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editingInquiry.name}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, name: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingInquiry.email}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, email: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={editingInquiry.phone || ""}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, phone: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Lifecycle Status</label>
                  <select
                    value={editingInquiry.status}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, status: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-xs text-gold-300 font-bold focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Space Type & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Space / Surface Type</label>
                  <input
                    type="text"
                    value={editingInquiry.spaceType}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, spaceType: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {SPACE_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditingInquiry({ ...editingInquiry, spaceType: p })}
                        className="px-2 py-0.5 rounded bg-obsidian-800 hover:bg-gold-500/20 text-[10px] text-neutral-400 hover:text-gold-300"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Room Dimensions / Sq.Ft</label>
                  <input
                    type="text"
                    placeholder="e.g. 64 sq.ft, 12 x 14 ft"
                    value={editingInquiry.roomDimensions || ""}
                    onChange={(e) => setEditingInquiry({ ...editingInquiry, roomDimensions: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Row 4: Estimated Quote Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Estimated Quote Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 9280.00"
                  value={editingInquiry.quoteAmount !== undefined && editingInquiry.quoteAmount !== null ? editingInquiry.quoteAmount : ""}
                  onChange={(e) =>
                    setEditingInquiry({
                      ...editingInquiry,
                      quoteAmount: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 font-mono"
                />
              </div>

              {/* Row 5: Project Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Client Project Message *</label>
                <textarea
                  rows={3}
                  required
                  value={editingInquiry.message}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, message: e.target.value })}
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Row 6: Internal Admin Follow-up Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gold-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Internal Studio Admin Notes (Private)
                </label>
                <textarea
                  rows={3}
                  placeholder="Record architect conversations, sample chip dispatch tracking number, follow-up dates..."
                  value={editingInquiry.adminNotes || ""}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, adminNotes: e.target.value })}
                  className="p-3 rounded-xl bg-obsidian-950 border border-gold-500/30 text-xs text-gold-200 placeholder:text-neutral-600 focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Submit / Cancel / Delete Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDeletingId(editingInquiry.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/30 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Inquiry
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingInquiry(null)}
                    className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-lg shadow-gold-500/20 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Modifications"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LOG MANUAL INQUIRY / QUOTE */}
      {/* ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-obsidian-900 border border-gold-500/30 p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400">
                  Manual Client Intake
                </span>
                <h2 className="text-xl font-serif font-bold text-white">Log Client Inquiry or Phone Quote</h2>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aurelia Vance"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aurelia@studio-architects.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Status</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-xs text-gold-300 font-bold focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Space Type</label>
                  <input
                    type="text"
                    value={newForm.spaceType}
                    onChange={(e) => setNewForm({ ...newForm, spaceType: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Room Dimensions / Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 120 sq.ft rotunda"
                    value={newForm.roomDimensions}
                    onChange={(e) => setNewForm({ ...newForm, roomDimensions: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {availableProducts.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Attached Product Spec</label>
                  <select
                    value={newForm.productId}
                    onChange={(e) => setNewForm({ ...newForm, productId: e.target.value })}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-gold-400"
                  >
                    <option value="">-- No specific catalog product --</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (${p.pricePerSqFt}/sq.ft)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Project Message / Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Architect requirements, marble preference, project timeline..."
                  value={newForm.message}
                  onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gold-400">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  placeholder="Private internal notes on sample box dispatch, estimated pricing..."
                  value={newForm.adminNotes}
                  onChange={(e) => setNewForm({ ...newForm, adminNotes: e.target.value })}
                  className="p-3 rounded-xl bg-obsidian-950 border border-gold-500/30 text-xs text-gold-200 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-lg shadow-gold-500/20 disabled:opacity-50"
                >
                  {isSaving ? "Creating..." : "Create Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-obsidian-900 border border-red-500/30 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Client Inquiry</h3>
                <p className="text-xs text-neutral-400">
                  Are you sure you want to delete this inquiry? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInquiry(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20"
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
