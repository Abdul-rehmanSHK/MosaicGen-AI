"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Search,
  Download,
  Trash2,
  RotateCcw,
  ExternalLink,
  X,
  Loader2,
  AlertTriangle,
  FolderArchive,
  Sparkles,
  CheckCircle2,
  User,
  Users,
  ArrowLeft,
  ChevronRight,
  Layers,
  Check,
} from "lucide-react";

interface Generation {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  prompt: string;
  placement: string;
  inputImageUrl?: string | null;
  maskUrl?: string | null;
  resultImageUrl: string;
  productId?: string | null;
  referenceProductId?: string | null;
  status: string;
  isTrashed?: boolean;
  trashedAt?: string | Date | null;
  createdAt: string | Date;
  user?: any;
  product?: any;
}

interface UserGroup {
  email: string;
  name?: string | null;
  totalCount: number;
  activeCount: number;
  trashedCount: number;
  lastGeneratedAt: string | Date;
  latestGeneration?: Generation;
  generations: Generation[];
}

interface DeleteTarget {
  generation: Generation;
  mode: "active" | "trash";
}

type TabType = "users" | "user-detail" | "all" | "trash";

export function GenerationsClient({ initialGenerations }: { initialGenerations: Generation[] }) {
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);

  // Downloading feedback state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Selection State
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Group generations by user email
  const userGroups = useMemo<UserGroup[]>(() => {
    const map = new Map<string, Generation[]>();

    for (const gen of generations) {
      const email = (gen.userEmail || gen.user?.email || "Guest User").toLowerCase().trim();
      if (!map.has(email)) {
        map.set(email, []);
      }
      map.get(email)!.push(gen);
    }

    const groups: UserGroup[] = [];
    map.forEach((gens, email) => {
      // Sort each user's generations chronologically descending
      const sorted = [...gens].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const active = sorted.filter((g) => !g.isTrashed);
      const trashed = sorted.filter((g) => g.isTrashed);

      groups.push({
        email,
        name: sorted[0]?.user?.name || null,
        totalCount: sorted.length,
        activeCount: active.length,
        trashedCount: trashed.length,
        lastGeneratedAt: sorted[0]?.createdAt || new Date(),
        latestGeneration: sorted[0],
        generations: sorted,
      });
    });

    // Sort user groups by most recent activity
    return groups.sort(
      (a, b) => new Date(b.lastGeneratedAt).getTime() - new Date(a.lastGeneratedAt).getTime()
    );
  }, [generations]);

  // Current active user group (if one is selected)
  const currentUserGroup = useMemo(() => {
    if (!selectedUserEmail) return null;
    return userGroups.find((ug) => ug.email.toLowerCase() === selectedUserEmail.toLowerCase()) || null;
  }, [userGroups, selectedUserEmail]);

  // Overall counts
  const overallActiveCount = useMemo(() => generations.filter((g) => !g.isTrashed).length, [generations]);
  const overallTrashedCount = useMemo(() => generations.filter((g) => g.isTrashed).length, [generations]);

  // Filtered User Groups (for "users" tab)
  const filteredUserGroups = useMemo(() => {
    if (!globalFilter.trim()) return userGroups;
    const q = globalFilter.toLowerCase().trim();
    return userGroups.filter(
      (ug) =>
        ug.email.toLowerCase().includes(q) ||
        (ug.name && ug.name.toLowerCase().includes(q)) ||
        ug.generations.some((g) => g.prompt.toLowerCase().includes(q) || g.placement.toLowerCase().includes(q))
    );
  }, [userGroups, globalFilter]);

  // Filtered Generations for "all" active tab
  const filteredAllGenerations = useMemo(() => {
    const active = generations.filter((g) => !g.isTrashed);
    if (!globalFilter.trim()) return active;
    const q = globalFilter.toLowerCase().trim();
    return active.filter(
      (g) =>
        g.prompt.toLowerCase().includes(q) ||
        g.placement.toLowerCase().includes(q) ||
        (g.userEmail && g.userEmail.toLowerCase().includes(q)) ||
        (g.user?.email && g.user.email.toLowerCase().includes(q))
    );
  }, [generations, globalFilter]);

  // Filtered Generations for "trash" tab
  const filteredTrashedGenerations = useMemo(() => {
    const trashed = generations.filter((g) => g.isTrashed);
    if (!globalFilter.trim()) return trashed;
    const q = globalFilter.toLowerCase().trim();
    return trashed.filter(
      (g) =>
        g.prompt.toLowerCase().includes(q) ||
        g.placement.toLowerCase().includes(q) ||
        (g.userEmail && g.userEmail.toLowerCase().includes(q)) ||
        (g.user?.email && g.user.email.toLowerCase().includes(q))
    );
  }, [generations, globalFilter]);

  // Filtered Generations for "user-detail" tab
  const filteredUserDetailGenerations = useMemo(() => {
    if (!currentUserGroup) return [];
    const userActive = currentUserGroup.generations.filter((g) => !g.isTrashed);
    if (!globalFilter.trim()) return userActive;
    const q = globalFilter.toLowerCase().trim();
    return userActive.filter(
      (g) => g.prompt.toLowerCase().includes(q) || g.placement.toLowerCase().includes(q)
    );
  }, [currentUserGroup, globalFilter]);

  // Reliable Browser File Download
  const handleDownload = async (gen: Generation) => {
    try {
      setDownloadingId(gen.id);
      const safePrompt = gen.prompt
        ? gen.prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
        : "mosaic-design";
      const filename = `${safePrompt}-${gen.id.slice(-6)}.png`;

      const downloadUrl = `/api/download?url=${encodeURIComponent(gen.resultImageUrl)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Download started!");
    } catch (err: any) {
      console.error("Download failed:", err);
      window.open(gen.resultImageUrl, "_blank");
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  // Move to Trash Box (Soft Delete)
  const handleMoveToTrash = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/nextjs-app/generations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "trash" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to move generation to trash");

      setGenerations((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, isTrashed: true, trashedAt: new Date().toISOString() } : g
        )
      );

      if (selectedGen?.id === id) setSelectedGen(null);
      setDeleteTarget(null);
      showToast("AI generation moved to Trash Box.");
    } catch (err: any) {
      alert("Error moving generation to trash: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Permanent Hard Delete from DB
  const handlePermanentDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/nextjs-app/generations?id=${id}&permanent=true`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to permanently delete generation");

      setGenerations((prev) => prev.filter((g) => g.id !== id));
      if (selectedGen?.id === id) setSelectedGen(null);
      setDeleteTarget(null);
      showToast("AI generation permanently deleted from database.");
    } catch (err: any) {
      alert("Error deleting generation permanently: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Generation
  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/nextjs-app/generations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "restore" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore generation");

      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isTrashed: false, trashedAt: null } : g))
      );

      showToast("AI generation restored to active view!");
    } catch (err: any) {
      alert("Error restoring generation: " + err.message);
    }
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently delete all items in the trash? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/nextjs-app/generations?action=empty-trash`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to empty trash");

      setGenerations((prev) => prev.filter((g) => !g.isTrashed));
      showToast(`Trash emptied: ${data.count || 0} generations deleted permanently.`);
    } catch (err: any) {
      alert("Error emptying trash: " + err.message);
    }
  };

  // Bulk Actions
  const handleBulkTrash = async () => {
    if (selectedGenIds.length === 0) return;
    if (!confirm(`Move ${selectedGenIds.length} selected generations to Trash?`)) return;
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/generations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedGenIds, action: "trash" }),
      });
      if (!res.ok) throw new Error("Failed to move generations to trash");
      setGenerations((prev) =>
        prev.map((g) =>
          selectedGenIds.includes(g.id)
            ? { ...g, isTrashed: true, trashedAt: new Date().toISOString() }
            : g
        )
      );
      showToast(`${selectedGenIds.length} generations moved to Trash.`);
      setSelectedGenIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedGenIds.length === 0) return;
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/generations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedGenIds, action: "restore" }),
      });
      if (!res.ok) throw new Error("Failed to restore generations");
      setGenerations((prev) =>
        prev.map((g) =>
          selectedGenIds.includes(g.id)
            ? { ...g, isTrashed: false, trashedAt: null }
            : g
        )
      );
      showToast(`${selectedGenIds.length} generations restored.`);
      setSelectedGenIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedGenIds.length === 0) return;
    if (
      !confirm(
        `PERMANENT DELETION: Are you sure you want to delete ${selectedGenIds.length} generations permanently from the database? This cannot be undone.`
      )
    ) {
      return;
    }
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/generations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedGenIds, permanent: true }),
      });
      if (!res.ok) throw new Error("Failed to permanently delete generations");
      setGenerations((prev) => prev.filter((g) => !selectedGenIds.includes(g.id)));
      showToast(`${selectedGenIds.length} generations permanently deleted.`);
      setSelectedGenIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  // Open User Detail Tab
  const handleOpenUserDetail = (email: string) => {
    setSelectedUserEmail(email);
    setActiveTab("user-detail");
    setSelectedGenIds([]);
    setGlobalFilter("");
  };

  // Close User Detail Tab
  const handleCloseUserTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserEmail(null);
    if (activeTab === "user-detail") {
      setActiveTab("users");
    }
    setSelectedGenIds([]);
  };

  // Current list for the active view to support Select All
  const currentViewGenerations = useMemo(() => {
    if (activeTab === "all") return filteredAllGenerations;
    if (activeTab === "trash") return filteredTrashedGenerations;
    if (activeTab === "user-detail") return filteredUserDetailGenerations;
    return [];
  }, [activeTab, filteredAllGenerations, filteredTrashedGenerations, filteredUserDetailGenerations]);

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 border border-stone-800 text-white text-xs shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200 shadow-xs">
            {/* Tab 1: Client Users */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setSelectedGenIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Client Users</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "users" ? "bg-stone-800 text-amber-300" : "bg-stone-100 text-stone-600"
                }`}
              >
                {userGroups.length}
              </span>
            </button>

            {/* Tab 2: User Detail (Active when a user is selected) */}
            {selectedUserEmail && currentUserGroup && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("user-detail");
                  setSelectedGenIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "user-detail"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-800 hover:bg-amber-50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="truncate max-w-[160px]">{currentUserGroup.email}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === "user-detail" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {currentUserGroup.activeCount}
                </span>
                <span
                  onClick={handleCloseUserTab}
                  className="p-0.5 rounded-full hover:bg-black/20 text-current cursor-pointer ml-0.5"
                  title="Close client tab"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            )}

            {/* Tab 3: All Active Generations */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setSelectedGenIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Generations</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "all" ? "bg-stone-800 text-amber-300" : "bg-stone-100 text-stone-600"
                }`}
              >
                {overallActiveCount}
              </span>
            </button>

            {/* Tab 4: Trash Box */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("trash");
                setSelectedGenIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "trash"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash Box</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "trash" ? "bg-red-700 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {overallTrashedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Empty Trash Button if on trash tab */}
        {activeTab === "trash" && overallTrashedCount > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Empty Trash Box
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={
              activeTab === "users"
                ? "Search client users by email or prompt..."
                : activeTab === "user-detail"
                ? `Search within ${currentUserGroup?.email || "this user"}'s designs...`
                : activeTab === "all"
                ? "Search all generations (email, prompt, placement)..."
                : "Search trash box..."
            }
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
          />
        </div>

        <span className="text-xs font-mono text-stone-500">
          {activeTab === "users" && (
            <>Showing {filteredUserGroups.length} client {filteredUserGroups.length === 1 ? "user" : "users"} ({overallActiveCount} active generations)</>
          )}
          {activeTab === "user-detail" && (
            <>Showing {filteredUserDetailGenerations.length} of {currentUserGroup?.activeCount || 0} active images for this client</>
          )}
          {activeTab === "all" && (
            <>Showing {filteredAllGenerations.length} of {overallActiveCount} active generations</>
          )}
          {activeTab === "trash" && (
            <>Showing {filteredTrashedGenerations.length} of {overallTrashedCount} trashed generations</>
          )}
        </span>
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedGenIds.length > 0 && (
        <div className="p-3.5 px-5 rounded-2xl bg-stone-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-mono font-bold text-xs flex items-center justify-center">
              {selectedGenIds.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedGenIds.length} {selectedGenIds.length === 1 ? "generation" : "generations"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedGenIds([])}
              className="text-stone-300 hover:text-white text-xs underline cursor-pointer ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab !== "trash" ? (
              <>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkTrash}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                </button>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkPermanentDelete}
                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkRestore}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Selected
                </button>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkPermanentDelete}
                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CLIENT USERS VIEW (One Row per User) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200/90 bg-white">
          {filteredUserGroups.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Users className="w-12 h-12 text-stone-400" />
              <p className="text-base font-serif font-bold text-stone-900">No client generations found</p>
              <p className="text-xs text-stone-500 max-w-sm">
                {globalFilter
                  ? "No users or prompts matched your search query."
                  : "When users generate designs in the studio, their accounts will appear grouped here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="p-4 font-semibold">Client User Email</th>
                    <th className="p-4 font-semibold text-center">Images Tried</th>
                    <th className="p-4 font-semibold">Latest Mosaic Concept</th>
                    <th className="p-4 font-semibold">Last Active</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUserGroups.map((group) => {
                    const initials = group.email.slice(0, 2).toUpperCase();
                    return (
                      <tr
                        key={group.email}
                        onClick={() => handleOpenUserDetail(group.email)}
                        className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                      >
                        {/* User Identity Column */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-300 font-serif font-bold text-xs text-stone-800 flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                                {group.email}
                              </span>
                              {group.name && (
                                <span className="text-[11px] text-stone-500 truncate">
                                  {group.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Images Tried Count */}
                        <td className="p-4 align-middle text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            {group.totalCount} {group.totalCount === 1 ? "image" : "images"}
                          </span>
                        </td>

                        {/* Latest Mosaic Concept Preview */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3 max-w-md">
                            {group.latestGeneration?.resultImageUrl && (
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-2xs">
                                <Image
                                  src={group.latestGeneration.resultImageUrl}
                                  alt="Latest concept"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                                {group.latestGeneration?.placement || "Bespoke"}
                              </span>
                              <p className="text-xs text-stone-600 truncate font-light">
                                {group.latestGeneration?.prompt || "Mosaic render"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Last Active Timestamp */}
                        <td className="p-4 align-middle text-xs font-mono text-stone-500 whitespace-nowrap">
                          {format(new Date(group.lastGeneratedAt), "MMM d, yyyy HH:mm")}
                        </td>

                        {/* Action: Open User Detail */}
                        <td className="p-4 align-middle text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUserDetail(group.email);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-stone-900 group-hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer"
                          >
                            <span>View All {group.totalCount}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER DETAIL TAB (All Generations for the Selected User) */}
      {/* ========================================================================= */}
      {activeTab === "user-detail" && currentUserGroup && (
        <div className="flex flex-col gap-6">
          {/* User Profile Banner */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 font-serif font-bold text-base text-amber-900 flex items-center justify-center shadow-2xs shrink-0">
                {currentUserGroup.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-700" /> Client Account
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {currentUserGroup.totalCount} total designs
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  {currentUserGroup.email}
                </h2>
                <span className="text-xs text-stone-500">
                  Last active: {format(new Date(currentUserGroup.lastGeneratedAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("users");
                  setSelectedGenIds([]);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to All Users
              </button>
            </div>
          </div>

          {/* User's Generations Table */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200/90 bg-white">
            {filteredUserDetailGenerations.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <FolderArchive className="w-12 h-12 text-stone-400" />
                <p className="text-base font-serif font-bold text-stone-900">No active designs found for this client</p>
                <p className="text-xs text-stone-500">
                  {globalFilter ? "No images matched your search filter." : "This client has no active generations."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="w-10 p-4 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredUserDetailGenerations.length > 0 &&
                            filteredUserDetailGenerations.every((g) => selectedGenIds.includes(g.id))
                          }
                          onChange={() => {
                            const ids = filteredUserDetailGenerations.map((g) => g.id);
                            const all = ids.every((id) => selectedGenIds.includes(id));
                            if (all) {
                              setSelectedGenIds((prev) => prev.filter((id) => !ids.includes(id)));
                            } else {
                              setSelectedGenIds((prev) => Array.from(new Set([...prev, ...ids])));
                            }
                          }}
                          className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 font-semibold">Thumbnail</th>
                      <th className="p-4 font-semibold">Timestamp</th>
                      <th className="p-4 font-semibold">Surface Placement</th>
                      <th className="p-4 font-semibold">Prompt Specification</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUserDetailGenerations.map((gen) => {
                      const isSelected = selectedGenIds.includes(gen.id);
                      const isDownloading = downloadingId === gen.id;

                      return (
                        <tr
                          key={gen.id}
                          className={`hover:bg-stone-50/70 transition-colors ${
                            isSelected ? "bg-stone-50" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 align-middle text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                const id = gen.id;
                                setSelectedGenIds((prev) =>
                                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                                );
                              }}
                              className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                            />
                          </td>

                          {/* Thumbnail */}
                          <td className="p-4 align-middle">
                            <div
                              onClick={() => setSelectedGen(gen)}
                              className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:scale-105 hover:border-stone-900 transition-all shadow-2xs"
                              title="Click to view full high-res render"
                            >
                              <Image
                                src={gen.resultImageUrl}
                                alt="Mosaic thumbnail"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="p-4 align-middle text-xs font-mono text-stone-500 whitespace-nowrap">
                            {format(new Date(gen.createdAt), "MMM d, yyyy HH:mm")}
                          </td>

                          {/* Surface Placement */}
                          <td className="p-4 align-middle whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-stone-100 border border-stone-200 text-stone-800">
                              {gen.placement || "Bespoke"}
                            </span>
                          </td>

                          {/* Prompt */}
                          <td className="p-4 align-middle">
                            <p
                              onClick={() => setSelectedGen(gen)}
                              className="text-xs text-stone-800 font-light line-clamp-2 max-w-lg cursor-pointer hover:text-amber-800 transition-colors"
                              title={gen.prompt}
                            >
                              {gen.prompt}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="p-4 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownload(gen)}
                                disabled={isDownloading}
                                className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-all cursor-pointer shadow-xs"
                                title="Download Image"
                              >
                                {isDownloading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ generation: gen, mode: "active" })}
                                className="p-2 rounded-xl bg-white hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-300 hover:border-red-300 transition-all cursor-pointer shadow-xs"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL GENERATIONS VIEW (Flat List across All Users) */}
      {/* ========================================================================= */}
      {activeTab === "all" && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200/90 bg-white">
          {filteredAllGenerations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Layers className="w-12 h-12 text-stone-400" />
              <p className="text-base font-serif font-bold text-stone-900">No active generations found</p>
              <p className="text-xs text-stone-500">
                {globalFilter ? "No generations matched your search." : "Generated images will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="w-10 p-4 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredAllGenerations.length > 0 &&
                          filteredAllGenerations.every((g) => selectedGenIds.includes(g.id))
                        }
                        onChange={() => {
                          const ids = filteredAllGenerations.map((g) => g.id);
                          const all = ids.every((id) => selectedGenIds.includes(id));
                          if (all) {
                            setSelectedGenIds((prev) => prev.filter((id) => !ids.includes(id)));
                          } else {
                            setSelectedGenIds((prev) => Array.from(new Set([...prev, ...ids])));
                          }
                        }}
                        className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 font-semibold">Thumbnail</th>
                    <th className="p-4 font-semibold">Timestamp</th>
                    <th className="p-4 font-semibold">Verified Client Email</th>
                    <th className="p-4 font-semibold">Placement</th>
                    <th className="p-4 font-semibold">Prompt Text</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAllGenerations.map((gen) => {
                    const isSelected = selectedGenIds.includes(gen.id);
                    const isDownloading = downloadingId === gen.id;
                    const email = gen.userEmail || gen.user?.email || "Guest User";

                    return (
                      <tr
                        key={gen.id}
                        className={`hover:bg-stone-50/70 transition-colors ${
                          isSelected ? "bg-stone-50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 align-middle text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const id = gen.id;
                              setSelectedGenIds((prev) =>
                                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                              );
                            }}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                          />
                        </td>

                        {/* Thumbnail */}
                        <td className="p-4 align-middle">
                          <div
                            onClick={() => setSelectedGen(gen)}
                            className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:scale-105 hover:border-stone-900 transition-all shadow-2xs"
                            title="Click to view full high-res render"
                          >
                            <Image
                              src={gen.resultImageUrl}
                              alt="Mosaic thumbnail"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="p-4 align-middle text-xs font-mono text-stone-500 whitespace-nowrap">
                          {format(new Date(gen.createdAt), "MMM d, yyyy HH:mm")}
                        </td>

                        {/* Verified Email */}
                        <td className="p-4 align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenUserDetail(email)}
                            className="text-xs font-semibold text-stone-900 hover:text-amber-700 transition-colors underline-offset-2 hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <User className="w-3 h-3 text-stone-400" />
                            <span>{email}</span>
                          </button>
                        </td>

                        {/* Placement */}
                        <td className="p-4 align-middle whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-stone-100 border border-stone-200 text-stone-800">
                            {gen.placement || "Bespoke"}
                          </span>
                        </td>

                        {/* Prompt */}
                        <td className="p-4 align-middle">
                          <p
                            onClick={() => setSelectedGen(gen)}
                            className="text-xs text-stone-800 font-light line-clamp-2 max-w-md cursor-pointer hover:text-amber-800 transition-colors"
                            title={gen.prompt}
                          >
                            {gen.prompt}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownload(gen)}
                              disabled={isDownloading}
                              className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-all cursor-pointer shadow-xs"
                              title="Download Image"
                            >
                              {isDownloading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ generation: gen, mode: "active" })}
                              className="p-2 rounded-xl bg-white hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-300 hover:border-red-300 transition-all cursor-pointer shadow-xs"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRASH BOX VIEW (Soft Deleted Generations) */}
      {/* ========================================================================= */}
      {activeTab === "trash" && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200/90 bg-white">
          {filteredTrashedGenerations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Trash2 className="w-12 h-12 text-stone-300" />
              <p className="text-base font-serif font-bold text-stone-900">Trash Box is empty</p>
              <p className="text-xs text-stone-500 max-w-sm">
                When you delete generations from active views, they will be kept here safely for recovery or permanent deletion.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-red-50/50 border-b border-red-100 text-[11px] font-mono uppercase tracking-wider text-red-700">
                  <tr>
                    <th className="w-10 p-4 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredTrashedGenerations.length > 0 &&
                          filteredTrashedGenerations.every((g) => selectedGenIds.includes(g.id))
                        }
                        onChange={() => {
                          const ids = filteredTrashedGenerations.map((g) => g.id);
                          const all = ids.every((id) => selectedGenIds.includes(id));
                          if (all) {
                            setSelectedGenIds((prev) => prev.filter((id) => !ids.includes(id)));
                          } else {
                            setSelectedGenIds((prev) => Array.from(new Set([...prev, ...ids])));
                          }
                        }}
                        className="rounded border-stone-300 text-red-600 focus:ring-red-400 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 font-semibold">Thumbnail</th>
                    <th className="p-4 font-semibold">Original Date</th>
                    <th className="p-4 font-semibold">Client Email</th>
                    <th className="p-4 font-semibold">Placement</th>
                    <th className="p-4 font-semibold">Prompt Text</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTrashedGenerations.map((gen) => {
                    const isSelected = selectedGenIds.includes(gen.id);
                    const email = gen.userEmail || gen.user?.email || "Guest User";

                    return (
                      <tr
                        key={gen.id}
                        className={`hover:bg-red-50/30 transition-colors ${
                          isSelected ? "bg-red-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 align-middle text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const id = gen.id;
                              setSelectedGenIds((prev) =>
                                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                              );
                            }}
                            className="rounded border-stone-300 text-red-600 focus:ring-red-400 cursor-pointer"
                          />
                        </td>

                        {/* Thumbnail */}
                        <td className="p-4 align-middle">
                          <div
                            onClick={() => setSelectedGen(gen)}
                            className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:scale-105 transition-all shadow-2xs opacity-80 hover:opacity-100"
                            title="Click to view full preview"
                          >
                            <Image
                              src={gen.resultImageUrl}
                              alt="Mosaic thumbnail"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="p-4 align-middle text-xs font-mono text-stone-500 whitespace-nowrap">
                          {format(new Date(gen.createdAt), "MMM d, yyyy HH:mm")}
                        </td>

                        {/* Client Email */}
                        <td className="p-4 align-middle whitespace-nowrap">
                          <span className="text-xs font-semibold text-stone-800">{email}</span>
                        </td>

                        {/* Placement */}
                        <td className="p-4 align-middle whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-stone-100 border border-stone-200 text-stone-700">
                            {gen.placement || "Bespoke"}
                          </span>
                        </td>

                        {/* Prompt */}
                        <td className="p-4 align-middle">
                          <p
                            onClick={() => setSelectedGen(gen)}
                            className="text-xs text-stone-600 font-light line-clamp-2 max-w-md cursor-pointer hover:text-stone-900 transition-colors"
                            title={gen.prompt}
                          >
                            {gen.prompt}
                          </p>
                        </td>

                        {/* Actions: Restore & Permanent Delete */}
                        <td className="p-4 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRestore(gen.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Restore to Active"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ generation: gen, mode: "trash" })}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-all cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col gap-5 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  {deleteTarget.mode === "active" ? "Delete AI Generation" : "Permanent Deletion"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-stone-600">
              <p className="line-clamp-2 italic text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                "{deleteTarget.generation.prompt}"
              </p>
              <p className="text-stone-500 text-[11px]">
                {deleteTarget.mode === "active"
                  ? "Move to trash box (can be restored anytime) or delete permanently from the database."
                  : "This will permanently delete this generation record and image. This action cannot be undone."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {deleteTarget.mode === "active" ? (
                <>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleMoveToTrash(deleteTarget.generation.id)}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                    Move to Trash
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handlePermanentDelete(deleteTarget.generation.id)}
                    className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handlePermanentDelete(deleteTarget.generation.id)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Permanent Delete
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-RESOLUTION PREVIEW LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row text-stone-900">
            <div className="relative w-full md:w-2/3 h-64 md:h-[500px] bg-stone-100">
              <Image
                src={selectedGen.resultImageUrl}
                alt="High Res Mosaic Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between gap-4 overflow-y-auto max-h-[500px] border-t md:border-t-0 md:border-l border-stone-200">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest block font-bold">
                      Bespoke Render
                    </span>
                    <h3 className="text-base font-serif font-bold text-stone-900">Generation Details</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGen(null)}
                    className="p-1 rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider font-bold">Client Email</span>
                  <p className="text-xs text-stone-800 font-semibold">{selectedGen.userEmail || selectedGen.user?.email || "Guest"}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider font-bold">Placement</span>
                  <p className="text-xs text-stone-800 font-medium">{selectedGen.placement}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider font-bold">Prompt Text</span>
                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed max-h-36 overflow-y-auto font-light">
                    {selectedGen.prompt}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedGen)}
                  disabled={downloadingId === selectedGen.id}
                  className="w-full py-2.5 rounded-xl font-serif font-medium text-xs bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  {downloadingId === selectedGen.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download High-Resolution
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedGen.resultImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center gap-1.5 transition-all border border-stone-300 font-medium"
                  >
                    Open Tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        generation: selectedGen,
                        mode: selectedGen.isTrashed ? "trash" : "active",
                      });
                    }}
                    className="py-2 px-3 rounded-xl text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition-all cursor-pointer"
                    title="Delete Generation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
