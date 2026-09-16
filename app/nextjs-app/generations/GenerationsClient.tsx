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
  Calendar,
  Check,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

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

interface DeleteTarget {
  generation: Generation;
  mode: "active" | "trash";
}

export function GenerationsClient({ initialGenerations }: { initialGenerations: Generation[] }) {
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);

  // Downloading feedback state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeGenerations = useMemo(
    () => generations.filter((g) => !g.isTrashed),
    [generations]
  );

  const trashedGenerations = useMemo(
    () => generations.filter((g) => g.isTrashed),
    [generations]
  );

  const displayedGenerations = activeTab === "active" ? activeGenerations : trashedGenerations;

  // Reliable Browser File Download
  const handleDownload = async (gen: Generation) => {
    try {
      setDownloadingId(gen.id);
      const safePrompt = gen.prompt
        ? gen.prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
        : "mosaic-design";
      const filename = `${safePrompt}-${gen.id.slice(-6)}.png`;

      // Use download endpoint for guaranteed browser attachment download without CORS issues
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
      // Fallback: open in new tab
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

  // Bulk Selection State
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Bulk Move to Trash
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

  // Bulk Restore
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

  // Bulk Permanent Delete
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

  const columns = useMemo<ColumnDef<Generation>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div className="w-8 flex items-center justify-center">
            <input
              type="checkbox"
              checked={
                displayedGenerations.length > 0 &&
                displayedGenerations.every((g) => selectedGenIds.includes(g.id))
              }
              onChange={() => {
                const currentIds = displayedGenerations.map((g) => g.id);
                const allSelected = currentIds.every((id) => selectedGenIds.includes(id));
                if (allSelected) {
                  setSelectedGenIds((prev) => prev.filter((id) => !currentIds.includes(id)));
                } else {
                  setSelectedGenIds((prev) => Array.from(new Set([...prev, ...currentIds])));
                }
              }}
              className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-8 flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedGenIds.includes(row.original.id)}
              onChange={(e) => {
                e.stopPropagation();
                const id = row.original.id;
                setSelectedGenIds((prev) =>
                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                );
              }}
              className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
            />
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: (info) => format(new Date(info.getValue() as string), "MMM d, yyyy HH:mm"),
      },
      {
        accessorKey: "userEmail",
        header: "Verified User Email",
        cell: (info) => info.getValue() || info.row.original.user?.email || "Guest",
      },
      {
        accessorKey: "prompt",
        header: "Prompt Text",
        cell: (info) => (
          <div
            className={`max-w-xs truncate text-xs cursor-pointer hover:text-gold-300 transition-colors ${
              info.row.original.isTrashed ? "line-through text-neutral-500" : "text-neutral-300"
            }`}
            title={info.getValue() as string}
            onClick={() => setSelectedGen(info.row.original)}
          >
            {info.getValue() as string}
          </div>
        ),
      },
      {
        id: "thumbnail",
        header: "Thumbnail",
        cell: (info) => (
          <div
            className={`relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 cursor-pointer hover:border-gold-400 transition-colors bg-obsidian-950 ${
              info.row.original.isTrashed ? "grayscale opacity-75" : ""
            }`}
            onClick={() => setSelectedGen(info.row.original)}
          >
            <Image src={info.row.original.resultImageUrl} alt="Thumbnail" fill className="object-cover" />
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const gen = info.row.original;
          const isDownloading = downloadingId === gen.id;

          if (gen.isTrashed) {
            return (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(gen.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Restore to Active Generations"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ generation: gen, mode: "trash" })}
                  className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-500/30 text-red-300 transition-colors"
                  title="Permanently Delete from Database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload(gen)}
                disabled={isDownloading}
                className="p-2 rounded-lg bg-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 text-gold-400 border border-neutral-700/60 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                title="Download image in browser"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget({ generation: gen, mode: "active" })}
                className="p-2 rounded-lg bg-obsidian-800 hover:bg-red-950/50 text-neutral-400 hover:text-red-400 border border-neutral-700/60 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                title="Delete or Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [downloadingId]
  );

  const table = useReactTable({
    data: displayedGenerations,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-obsidian-900 border border-gold-500/40 text-gold-300 text-xs shadow-2xl shadow-gold-500/10 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Tabs and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-obsidian-900 border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "active"
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Generations</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "active" ? "bg-obsidian-950 text-gold-300" : "bg-obsidian-800 text-neutral-300"
              }`}
            >
              {activeGenerations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trash")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "trash"
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash Box</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "trash" ? "bg-obsidian-950 text-red-300" : "bg-obsidian-800 text-neutral-300"
              }`}
            >
              {trashedGenerations.length}
            </span>
          </button>
        </div>

        {/* Empty Trash Button */}
        {activeTab === "trash" && trashedGenerations.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Empty Trash Box
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-obsidian-900 p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search generations (email, prompt)..."
            className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        <span className="text-xs font-mono text-neutral-400">
          Showing {table.getRowModel().rows.length} of {displayedGenerations.length}{" "}
          {activeTab === "active" ? "active" : "trashed"} generations
        </span>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedGenIds.length > 0 && (
        <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 font-mono font-bold text-xs flex items-center justify-center">
              {selectedGenIds.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedGenIds.length} {selectedGenIds.length === 1 ? "generation" : "generations"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedGenIds([])}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "active" ? (
              <>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkTrash}
                  className="px-3.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-amber-950/40 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                </button>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkPermanentDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
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
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Selected
                </button>
                <button
                  type="button"
                  disabled={isBulkActing}
                  onClick={handleBulkPermanentDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`rounded-2xl overflow-hidden shadow-xl border ${
          activeTab === "trash"
            ? "bg-obsidian-900 border-red-500/20"
            : "bg-obsidian-900 border-neutral-800"
        }`}
      >
        {displayedGenerations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            {activeTab === "trash" ? (
              <>
                <FolderArchive className="w-12 h-12 text-neutral-600" />
                <p className="text-sm font-serif text-neutral-400">Trash box is empty</p>
                <p className="text-xs text-neutral-500">
                  AI generations moved to trash will appear here where they can be restored or deleted forever.
                </p>
              </>
            ) : (
              <>
                <Sparkles className="w-12 h-12 text-neutral-600" />
                <p className="text-sm font-serif text-neutral-400">No active AI generations</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead
                  className={`uppercase tracking-wider text-xs border-b ${
                    activeTab === "trash"
                      ? "bg-obsidian-950 text-red-300 border-neutral-800"
                      : "bg-obsidian-950 text-gold-400 font-serif border-neutral-800"
                  }`}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="p-4 font-semibold whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-obsidian-800/50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-obsidian-950/50 text-xs">
              <span className="text-neutral-500">
                Showing {table.getRowModel().rows.length} of {displayedGenerations.length} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1.5 rounded-lg bg-obsidian-800 text-neutral-300 disabled:opacity-50 hover:bg-obsidian-700 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1.5 rounded-lg bg-obsidian-800 text-neutral-300 disabled:opacity-50 hover:bg-obsidian-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL (CHOOSE: MOVE TO TRASH OR DELETE PERMANENTLY) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-white text-base">
                  {deleteTarget.mode === "active" ? "Delete AI Generation" : "Permanent Deletion"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-neutral-300">
              <p className="line-clamp-2 italic text-neutral-200 bg-obsidian-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                "{deleteTarget.generation.prompt}"
              </p>
              <p className="text-neutral-400 text-[11px]">
                {deleteTarget.mode === "active"
                  ? "Move to trash (can restore) or delete permanently."
                  : "This action cannot be undone."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {deleteTarget.mode === "active" ? (
                <>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleMoveToTrash(deleteTarget.generation.id)}
                    className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-gold-500/20 transition-all cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                    Move to Trash
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handlePermanentDelete(deleteTarget.generation.id)}
                    className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" /> Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handlePermanentDelete(deleteTarget.generation.id)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Delete
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-400 hover:text-white text-xs font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-RESOLUTION PREVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row">
            <div className="relative w-full md:w-2/3 h-64 md:h-[500px] bg-obsidian-950">
              <Image
                src={selectedGen.resultImageUrl}
                alt="High Res Mosaic Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between gap-4 overflow-y-auto max-h-[500px] border-t md:border-t-0 md:border-l border-neutral-800">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">
                      Preview
                    </span>
                    <h3 className="text-base font-serif font-bold text-white">Generation Details</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGen(null)}
                    className="p-1 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">User</span>
                  <p className="text-xs text-neutral-300">{selectedGen.userEmail || selectedGen.user?.email || "Guest"}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Placement</span>
                  <p className="text-xs text-neutral-300 font-medium">{selectedGen.placement}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Prompt</span>
                  <p className="text-xs text-neutral-300 bg-obsidian-950 p-3 rounded-xl border border-neutral-800 leading-relaxed max-h-36 overflow-y-auto">
                    {selectedGen.prompt}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedGen)}
                  disabled={downloadingId === selectedGen.id}
                  className="w-full py-2.5 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 cursor-pointer"
                >
                  {downloadingId === selectedGen.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Image to Browser
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedGen.resultImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl text-xs bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all border border-neutral-700/60"
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
                    className="py-2 px-3 rounded-xl text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 flex items-center justify-center transition-all"
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
