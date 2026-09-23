"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
  Mail,
  Search,
  Download,
  Maximize2,
  Grid,
  List,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export interface GenerationItem {
  id: string;
  prompt: string;
  placement: string;
  resultImageUrl: string;
  inputImageUrl?: string | null;
  createdAt: string;
}

interface MyGenerationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onSelectGeneration?: (gen: GenerationItem) => void;
  onUseDifferentEmail?: () => void;
}

export function MyGenerationsModal({
  isOpen,
  onClose,
  email,
  onSelectGeneration,
  onUseDifferentEmail,
}: MyGenerationsModalProps) {
  const { data: session } = useSession();
  const [activeEmail, setActiveEmail] = useState<string>(email || "");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [usedCount, setUsedCount] = useState<number>(0);
  const [maxLimit, setMaxLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [lightboxItem, setLightboxItem] = useState<GenerationItem | null>(null);

  // Sync or discover email on open
  useEffect(() => {
    if (!isOpen) return;

    let targetEmail = (email || "").trim();
    if (!targetEmail && typeof window !== "undefined") {
      targetEmail = (
        localStorage.getItem("zm_verified_email") ||
        localStorage.getItem("mec_verified_email") ||
        ""
      ).trim();
    }

    if (!targetEmail && session?.user?.email) {
      targetEmail = session.user.email.trim();
    }

    if (targetEmail) {
      setActiveEmail(targetEmail);
      setInputEmail(targetEmail);
      fetchHistory(targetEmail);
    } else {
      setActiveEmail("");
      setGenerations([]);
      setUsedCount(0);
    }
  }, [isOpen, email, session]);

  const fetchHistory = async (targetEmail: string) => {
    const clean = targetEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/my-generations?email=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history");

      const gens = data.generations || [];
      setGenerations(gens);
      setUsedCount(typeof data.usedCount === "number" ? data.usedCount : gens.length);
      setMaxLimit(typeof data.maxLimit === "number" ? data.maxLimit : 5);
      setActiveEmail(clean);
    } catch (err: any) {
      setError(err.message || "Failed to load generations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = (e: React.MouseEvent, item: GenerationItem) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = item.resultImageUrl;
      const cleanPlacement = (item.placement || "mosaic").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `zakiah-mosaic-${cleanPlacement}-${item.id.slice(-6)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download image:", err);
      window.open(item.resultImageUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((usedCount / maxLimit) * 100));
  const remaining = Math.max(0, maxLimit - usedCount);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-4xl max-h-[90vh] p-5 sm:p-7 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-4 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-white text-lg sm:text-xl flex items-center gap-2">
                  My Architectural Generations
                </h2>
                <p className="text-xs text-neutral-400">
                  {activeEmail ? (
                    <>
                      Saved mosaic preview renders for{" "}
                      <span className="text-gold-300 font-semibold font-mono">{activeEmail}</span>
                    </>
                  ) : (
                    "Look up your saved bespoke mosaic preview renders"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              {generations.length > 0 && (
                <div className="hidden sm:flex items-center p-1 rounded-xl bg-obsidian-950 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      viewMode === "grid"
                        ? "bg-gold-500 text-obsidian-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Gallery Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      viewMode === "list"
                        ? "bg-gold-500 text-obsidian-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Compact List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeEmail && (
                <button
                  type="button"
                  onClick={() => fetchHistory(activeEmail)}
                  disabled={isLoading}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 transition-colors cursor-pointer"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-gold-400" : ""}`} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quota Progress Banner Card */}
          {activeEmail && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-obsidian-950/90 border border-gold-500/30 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Free Previews Quota
                  </span>
                  {usedCount >= maxLimit ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                      Limit Reached (5 of 5 Done)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                      {remaining} Previews Remaining
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono font-bold text-gold-300">
                  {usedCount} / {maxLimit} Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-obsidian-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>
                  {usedCount >= maxLimit
                    ? "You have completed all 5 complimentary previews for this email."
                    : `${usedCount} of ${maxLimit} previews generated.`}
                </span>
                {onUseDifferentEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUseDifferentEmail();
                    }}
                    className="text-gold-300 hover:text-gold-200 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Switch to a different email →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Email Lookup Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputEmail.trim()) {
                fetchHistory(inputEmail.trim());
              }
            }}
            className="flex items-center gap-2 p-2 rounded-2xl bg-obsidian-950 border border-neutral-800"
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Enter client or firm email to view generations..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputEmail.trim()}
              className="py-2 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Lookup
            </button>
          </form>

          {/* Content Gallery / List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[300px] max-h-[50vh]">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                <span className="text-xs font-mono">Retrieving your mosaic renders...</span>
              </div>
            ) : error ? (
              <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center text-red-300 text-xs flex flex-col items-center gap-2 my-auto">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <span>{error}</span>
                {activeEmail && (
                  <button
                    type="button"
                    onClick={() => fetchHistory(activeEmail)}
                    className="text-gold-400 hover:underline text-xs mt-1"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : generations.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-center my-auto">
                <Layers className="w-12 h-12 text-neutral-600 mb-1" />
                <p className="text-sm font-semibold text-neutral-300">
                  {activeEmail ? "No generations found for this email" : "Enter an email address above"}
                </p>
                <p className="text-xs text-neutral-500 max-w-sm">
                  {activeEmail
                    ? "Designs rendered for this email will appear here with full high-resolution image previews and artisan specs."
                    : "Type the email address you used when generating to retrieve your saved mosaic renders."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* ================= GRID VIEW: VISUAL IMAGE CARDS ================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generations.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-obsidian-950/90 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col overflow-hidden group shadow-lg"
                  >
                    {/* Visual Image Container - Uses direct <img> to support base64 without Next.js optimization failure */}
                    <div
                      className="relative h-48 sm:h-52 w-full bg-obsidian-900 cursor-pointer overflow-hidden"
                      onClick={() => setLightboxItem(item)}
                    >
                      <img
                        src={item.resultImageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-obsidian-950/90 text-gold-300 border border-gold-500/40 backdrop-blur-md shadow-md">
                          Preview {index + 1} of {generations.length}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-obsidian-950/80 text-neutral-300 border border-neutral-800 backdrop-blur-md">
                          {item.placement}
                        </span>
                      </div>

                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 bg-obsidian-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="py-1.5 px-3 rounded-xl bg-obsidian-900/90 border border-gold-500/40 text-gold-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5" /> View Fullscreen
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Action Buttons */}
                    <div className="p-4 flex flex-col gap-3 justify-between flex-1">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 line-clamp-2 italic font-serif leading-relaxed">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                        {onSelectGeneration && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectGeneration(item);
                              onClose();
                            }}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            Load in Studio
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadImage(e, item)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Download high-resolution mosaic image"
                        >
                          <Download className="w-3.5 h-3.5 text-gold-400" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ================= COMPACT LIST VIEW ================= */
              generations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-obsidian-950/70 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gold-500/20 bg-obsidian-900 shrink-0 cursor-pointer"
                      onClick={() => setLightboxItem(item)}
                    >
                      <img
                        src={item.resultImageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex flex-col gap-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                          {item.placement}
                        </span>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 line-clamp-2 italic font-serif">
                        &ldquo;{item.prompt}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadImage(e, item)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 border border-neutral-800 transition-colors cursor-pointer"
                      title="Download image"
                    >
                      <Download className="w-4 h-4 text-gold-400" />
                    </button>
                    {onSelectGeneration && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGeneration(item);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 text-gold-300 border border-gold-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        Load in Studio
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-neutral-800 pt-3 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono">
              Total Rendered: <strong className="text-gold-300">{usedCount} of {maxLimit} Previews</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-obsidian-950/95 backdrop-blur-xl animate-fadeIn"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col gap-3 rounded-3xl bg-obsidian-900 border border-gold-500/40 p-4 sm:p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-2xl overflow-hidden border border-gold-500/20 bg-black flex items-center justify-center">
              <img
                src={lightboxItem.resultImageUrl}
                alt={lightboxItem.prompt}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-col gap-1 max-w-xl">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider font-bold">
                  {lightboxItem.placement} • Artisan Mosaic Concept
                </span>
                <p className="text-xs text-neutral-200 italic font-serif line-clamp-2">
                  &ldquo;{lightboxItem.prompt}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDownloadImage(e, lightboxItem)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gold-400" />
                  Download High-Res
                </button>
                {onSelectGeneration && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectGeneration(lightboxItem);
                      setLightboxItem(null);
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    Load in Studio
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
