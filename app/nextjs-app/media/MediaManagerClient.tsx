"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileImage,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  HardDrive,
  Search,
  Loader2,
  X,
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  originalSize: number;
  width: number | null;
  height: number | null;
  createdAt: string | Date;
}

interface MediaStats {
  totalCount: number;
  totalOriginalBytes: number;
  totalOptimizedBytes: number;
  bytesSaved: number;
  savingsPercent: number;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function MediaManagerClient({
  initialMedia,
  initialStats,
}: {
  initialMedia: MediaItem[];
  initialStats: MediaStats;
}) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [stats, setStats] = useState<MediaStats>(initialStats);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Bulk Selection State
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isBulkDeletingMedia, setIsBulkDeletingMedia] = useState(false);

  const toggleSelectMedia = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMedia = (items: MediaItem[]) => {
    const itemIds = items.map((m) => m.id);
    const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedMediaIds.includes(id));
    if (allSelected) {
      setSelectedMediaIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedMediaIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBulkDeleteMedia = async () => {
    if (selectedMediaIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete ${selectedMediaIds.length} media files from disk and database? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsBulkDeletingMedia(true);
    try {
      const res = await fetch("/api/nextjs-app/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedMediaIds }),
      });
      if (!res.ok) throw new Error("Bulk deletion failed");

      const deletedItems = mediaList.filter((m) => selectedMediaIds.includes(m.id));
      setMediaList((prev) => prev.filter((m) => !selectedMediaIds.includes(m.id)));

      // Update stats
      let origRemoved = 0;
      let optRemoved = 0;
      deletedItems.forEach((d) => {
        origRemoved += d.originalSize || d.size;
        optRemoved += d.size;
      });

      setStats((prev) => {
        const newOrig = Math.max(0, prev.totalOriginalBytes - origRemoved);
        const newOpt = Math.max(0, prev.totalOptimizedBytes - optRemoved);
        const saved = Math.max(0, newOrig - newOpt);
        return {
          totalCount: Math.max(0, prev.totalCount - deletedItems.length),
          totalOriginalBytes: newOrig,
          totalOptimizedBytes: newOpt,
          bytesSaved: saved,
          savingsPercent: newOrig > 0 ? Math.round((saved / newOrig) * 100) : 0,
        };
      });

      setSelectedMediaIds([]);
    } catch (err: any) {
      alert("Error deleting media assets: " + err.message);
    } finally {
      setIsBulkDeletingMedia(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyUrl = (item: MediaItem) => {
    // Copy full absolute URL or relative URL
    const fullUrl = window.location.origin + item.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      setErrorMessage("Please select valid image files (JPG, PNG, WEBP, etc.)");
      setIsUploading(false);
      return;
    }

    try {
      const newlyUploaded: MediaItem[] = [];
      let totalOrig = 0;
      let totalOpt = 0;

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`Compressing & converting (${i + 1}/${validFiles.length}): ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/nextjs-app/media", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newlyUploaded.push(data.media);
        totalOrig += data.media.originalSize || file.size;
        totalOpt += data.media.size;
      }

      setMediaList((prev) => [...newlyUploaded, ...prev]);

      // Update stats
      setStats((prev) => {
        const newTotalCount = prev.totalCount + newlyUploaded.length;
        const newOrig = prev.totalOriginalBytes + totalOrig;
        const newOpt = prev.totalOptimizedBytes + totalOpt;
        const saved = Math.max(0, newOrig - newOpt);
        return {
          totalCount: newTotalCount,
          totalOriginalBytes: newOrig,
          totalOptimizedBytes: newOpt,
          bytesSaved: saved,
          savingsPercent: newOrig > 0 ? Math.round((saved / newOrig) * 100) : 0,
        };
      });

      setUploadProgress("");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset permanently?")) return;

    try {
      const res = await fetch(`/api/nextjs-app/media?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      const deletedItem = mediaList.find((m) => m.id === id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));

      if (deletedItem) {
        setStats((prev) => {
          const newOrig = Math.max(0, prev.totalOriginalBytes - (deletedItem.originalSize || deletedItem.size));
          const newOpt = Math.max(0, prev.totalOptimizedBytes - deletedItem.size);
          const saved = Math.max(0, newOrig - newOpt);
          return {
            totalCount: Math.max(0, prev.totalCount - 1),
            totalOriginalBytes: newOrig,
            totalOptimizedBytes: newOpt,
            bytesSaved: saved,
            savingsPercent: newOrig > 0 ? Math.round((saved / newOrig) * 100) : 0,
          };
        });
      }
    } catch (err: any) {
      alert("Error deleting media item.");
    }
  };

  const filteredMedia = mediaList.filter(
    (m) =>
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-lg flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <FileImage className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Media Assets</span>
            <p className="text-xl font-bold font-serif text-white">{stats.totalCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-lg flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Storage Saved</span>
            <p className="text-xl font-bold font-serif text-emerald-400">
              {formatBytes(stats.bytesSaved)} ({stats.savingsPercent}%)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-lg flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Optimized Size</span>
            <p className="text-xl font-bold font-serif text-white">{formatBytes(stats.totalOptimizedBytes)}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-lg flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Standard Format</span>
            <p className="text-xl font-bold font-serif text-gold-400">WebP Lossless/82</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`relative p-8 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? "border-gold-400 bg-gold-500/10 scale-[1.005]"
            : "border-neutral-800 bg-obsidian-900/60 hover:border-gold-500/40 hover:bg-obsidian-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-md">
          {isUploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
        </div>

        <div>
          <h3 className="text-base font-serif font-bold text-white">
            {isUploading ? "Optimizing & Uploading..." : "Upload New Images"}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isUploading
              ? uploadProgress
              : "Drag and drop PNG, JPG, or WEBP images here, or click to browse files from your device"}
          </p>
        </div>

        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Browse Device Files
          </button>
        )}

        <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-mono mt-1">
          <span>• Auto WebP conversion</span>
          <span>• Smart compression (quality 82)</span>
          <span>• Max display width 2560px</span>
        </div>

        {errorMessage && (
          <div className="mt-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-gold-500/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectAllMedia(filteredMedia)}
            className="px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
          >
            {filteredMedia.length > 0 && filteredMedia.every((m) => selectedMediaIds.includes(m.id))
              ? "Deselect All"
              : "Select All"}
          </button>
          <span className="text-xs font-mono text-neutral-400">
            Showing {filteredMedia.length} of {mediaList.length} files
          </span>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedMediaIds.length > 0 && (
        <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 font-mono font-bold text-xs flex items-center justify-center">
              {selectedMediaIds.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedMediaIds.length} {selectedMediaIds.length === 1 ? "image" : "images"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedMediaIds([])}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isBulkDeletingMedia}
              onClick={handleBulkDeleteMedia}
              className="px-4 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected Images
            </button>
          </div>
        </div>
      )}

      {/* Media Gallery Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 rounded-2xl bg-obsidian-900 border border-neutral-800 text-center flex flex-col items-center justify-center gap-3">
          <FileImage className="w-12 h-12 text-neutral-600" />
          <p className="text-sm font-serif text-neutral-400">No media assets found</p>
          <p className="text-xs text-neutral-500 max-w-sm">
            {searchQuery ? "No files matched your search query." : "Upload images above to build your optimized media library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedMediaIds.includes(item.id);
            const savings =
              item.originalSize > 0
                ? Math.round(((item.originalSize - item.size) / item.originalSize) * 100)
                : 0;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl bg-obsidian-900 border overflow-hidden shadow-lg transition-all flex flex-col ${
                  isSelected
                    ? "border-gold-400 ring-2 ring-gold-500/40 shadow-gold-500/10"
                    : "border-neutral-800 hover:border-gold-500/40"
                }`}
              >
                {/* Image Thumbnail */}
                <div
                  className="relative aspect-square w-full bg-obsidian-950 cursor-pointer overflow-hidden"
                  onClick={() => setPreviewMedia(item)}
                >
                  <Image
                    src={item.url}
                    alt={item.originalName || item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Multi-Select Checkbox */}
                  <div 
                    className="absolute top-2 left-2 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectMedia(item.id)}
                      className="w-4 h-4 rounded border-neutral-700 bg-obsidian-950/90 text-gold-500 focus:ring-gold-400 cursor-pointer shadow-md"
                    />
                  </div>

                  {/* WebP Badge */}
                  <div className="absolute top-2 left-8 px-2 py-0.5 rounded-md bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-[9px] font-mono font-bold text-gold-400 uppercase z-10">
                    WEBP
                  </div>

                  {/* Savings Badge */}
                  {savings > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 z-10">
                      -{savings}%
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-obsidian-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2 rounded-lg bg-obsidian-900/90 text-white hover:text-gold-400 shadow">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between text-xs">
                  <div>
                    <p className="font-medium text-white truncate text-[11px]" title={item.originalName || item.filename}>
                      {item.originalName || item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>{formatBytes(item.size)}</span>
                      {item.width && item.height && (
                        <span>
                          {item.width}×{item.height}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors ${
                        copiedId === item.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-obsidian-800 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-300 border border-neutral-700/50"
                      }`}
                      title="Copy URL to clipboard"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy URL
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg bg-obsidian-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-700/50 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-white text-base">
                  {previewMedia.originalName || previewMedia.filename}
                </h3>
                <span className="text-[11px] font-mono text-gold-400">{previewMedia.url}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-[55vh] bg-obsidian-950 flex items-center justify-center">
              <Image
                src={previewMedia.url}
                alt={previewMedia.originalName}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-obsidian-900/90 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
                <span>
                  Dimensions: <strong className="text-white">{previewMedia.width}×{previewMedia.height}px</strong>
                </span>
                <span>
                  Optimized: <strong className="text-emerald-400">{formatBytes(previewMedia.size)}</strong>
                </span>
                {previewMedia.originalSize > 0 && (
                  <span>
                    Original: <strong className="text-neutral-400">{formatBytes(previewMedia.originalSize)}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewMedia)}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Image URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
