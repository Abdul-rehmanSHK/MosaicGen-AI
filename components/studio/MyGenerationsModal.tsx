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
  AlertCircle,
  CheckCircle2,
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
  const maxLimit = 5;
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

      if (data.email) {
        setActiveEmail(data.email);
        setInputEmail(data.email);
      } else {
        setActiveEmail(clean);
      }
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
  const sessionEmail = session?.user?.email?.trim().toLowerCase();

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-6 animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative w-full max-w-4xl max-h-[88vh] rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col overflow-hidden text-stone-900 my-auto animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Fixed Header */}
          <div className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-3.5 border-b border-stone-100 flex flex-col gap-3.5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <Sparkles className="w-5 h-5 text-stone-700" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-xl">
                    My Architectural Generations
                  </h2>
                  <p className="text-xs text-stone-500">
                    {activeEmail ? (
                      <>
                        Saved preview renders for{" "}
                        <span className="text-stone-900 font-semibold font-mono">{activeEmail}</span>
                      </>
                    ) : (
                      "Look up your saved bespoke mosaic preview renders"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* View Toggle */}
                {generations.length > 0 && (
                  <div className="hidden sm:flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-stone-900 text-white font-bold"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                      title="Gallery Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-stone-900 text-white font-bold"
                          : "text-stone-500 hover:text-stone-900"
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
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Refresh history"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-stone-700" : ""}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quota Progress Banner Card */}
            {activeEmail && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-stone-600" /> Free Previews Quota
                    </span>
                    {usedCount >= maxLimit ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-mono font-bold">
                        Limit Reached (5 of 5 Used)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
                        {remaining} Previews Remaining
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono font-bold text-stone-900">
                    {usedCount} / {maxLimit} Completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-stone-900 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 flex-wrap gap-1">
                  <span>
                    {usedCount >= maxLimit
                      ? "You have utilized all 5 complimentary previews for this email."
                      : `${usedCount} of ${maxLimit} previews generated.`}
                  </span>
                  {onUseDifferentEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onUseDifferentEmail();
                      }}
                      className="text-stone-800 hover:underline text-[11px] font-semibold cursor-pointer"
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
              className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-stone-50 border border-stone-200"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter client or firm email to view generations..."
                  className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputEmail.trim()}
                className="py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Lookup</span>
              </button>
            </form>

            {/* Quick Email Suggestion Chips (if logged-in session has a different email) */}
            {sessionEmail && sessionEmail !== activeEmail.toLowerCase() && (
              <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100/70 px-3 py-1.5 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500 font-mono">Logged in as:</span>
                <strong className="text-stone-900 font-mono text-[11px]">{sessionEmail}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setInputEmail(sessionEmail);
                    fetchHistory(sessionEmail);
                  }}
                  className="ml-auto text-[11px] font-bold text-stone-900 hover:underline cursor-pointer flex items-center gap-1"
                >
                  View generations for this account →
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Middle Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-7 py-4 flex flex-col gap-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin text-stone-800" />
                <span className="text-xs font-mono">Retrieving your mosaic renders...</span>
              </div>
            ) : error ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center text-rose-800 text-xs flex flex-col items-center gap-2 my-auto">
                <AlertCircle className="w-6 h-6 text-rose-600" />
                <span className="font-medium">{error}</span>
                {activeEmail && (
                  <button
                    type="button"
                    onClick={() => fetchHistory(activeEmail)}
                    className="text-stone-900 underline font-semibold text-xs mt-1 cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : generations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center my-auto">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                  <Layers className="w-7 h-7 text-stone-500" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <p className="text-base font-serif font-bold text-stone-900">
                    {activeEmail ? "No generations found for this email" : "Enter an email address above"}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {activeEmail
                      ? `No saved mosaic renders were found for "${activeEmail}". If you used another email or account, enter it in the lookup bar above.`
                      : "Type the email address you used when generating to retrieve your saved mosaic renders."}
                  </p>
                </div>

                {/* If user is logged in, offer quick 1-click lookup for their session email */}
                {sessionEmail && sessionEmail !== activeEmail.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputEmail(sessionEmail);
                      fetchHistory(sessionEmail);
                    }}
                    className="mt-2 py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Check account email: {sessionEmail}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* ================= GRID VIEW: VISUAL IMAGE CARDS ================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                {generations.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all flex flex-col overflow-hidden group shadow-2xs hover:shadow-md"
                  >
                    {/* Visual Image Container */}
                    <div
                      className="relative h-48 sm:h-52 w-full bg-stone-100 cursor-pointer overflow-hidden"
                      onClick={() => setLightboxItem(item)}
                    >
                      <img
                        src={item.resultImageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/mosaic-finder-pattern-dark.png";
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/95 text-stone-800 border border-stone-200 shadow-sm backdrop-blur-md">
                          Preview {index + 1} of {generations.length}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/90 text-stone-700 border border-stone-200 backdrop-blur-md">
                          {item.placement}
                        </span>
                      </div>

                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="py-1.5 px-3 rounded-xl bg-white/95 border border-stone-200 text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5" /> View Fullscreen
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Action Buttons */}
                    <div className="p-4 flex flex-col gap-3 justify-between flex-1 bg-white">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 line-clamp-2 italic font-serif leading-relaxed">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        {onSelectGeneration && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectGeneration(item);
                              onClose();
                            }}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            Load in Studio
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadImage(e, item)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Download high-resolution mosaic image"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ================= COMPACT LIST VIEW ================= */
              <div className="flex flex-col gap-3 pb-2">
                {generations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 cursor-pointer"
                        onClick={() => setLightboxItem(item)}
                      >
                        <img
                          src={item.resultImageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/mosaic-finder-pattern-dark.png";
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                            {item.placement}
                          </span>
                          <span className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 italic font-serif line-clamp-2 leading-relaxed">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadImage(e, item)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {onSelectGeneration && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGeneration(item);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-black text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          Load in Studio
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Fixed Footer */}
          <div className="shrink-0 border-t border-stone-100 px-5 sm:px-7 py-3 bg-stone-50/70 flex items-center justify-between text-xs text-stone-500">
            <span className="font-mono">
              Total Rendered: <strong className="text-stone-900">{usedCount} of {maxLimit} Previews</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xl animate-fadeIn"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col gap-3 rounded-3xl bg-white border border-stone-200 p-4 sm:p-6 shadow-2xl overflow-hidden text-stone-900 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all cursor-pointer z-10"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center">
              <img
                src={lightboxItem.resultImageUrl}
                alt={lightboxItem.prompt}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/mosaic-finder-pattern-dark.png";
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-col gap-1 max-w-xl">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">
                  {lightboxItem.placement} • Bespoke Mosaic Concept
                </span>
                <p className="text-xs text-stone-700 italic font-serif line-clamp-2">
                  &ldquo;{lightboxItem.prompt}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDownloadImage(e, lightboxItem)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>Download High-Res</span>
                </button>
                {onSelectGeneration && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectGeneration(lightboxItem);
                      setLightboxItem(null);
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Load in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
