"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Loader2, Download, CheckCircle2, Send, PhoneCall, Grid, Sparkles, ArrowLeft } from "lucide-react";

export interface GenerationResultData {
  resultImageUrl: string;
  estimatedSqFt: number;
  estimatedTileCount: number;
  estimatedMaterialCost: number;
  promptApplied: string;
}

interface GenerationWorkingScreenProps {
  prompt: string;
  placement: string;
  roomPhotoUrl: string | null;
  roomPhotoName: string | null;
  finish?: string;
  groutColor?: string;
  isGenerating?: boolean;
  result?: GenerationResultData | null;
  onCancel?: () => void;
  onDownload?: () => void;
  onRequestQuote?: () => void;
  onRequestSpecialist?: () => void;
  onBackToStudio?: () => void;
}

const PLACEMENT_OPTIONS = [
  "Auto-detect",
  "Backsplash",
  "Accent wall",
  "Floor medallion",
  "Pool",
  "Entryway",
];

const STAGES = [
  { at: 0, text: "Analyzing architectural space..." },
  { at: 20, text: "Laying the tiles..." },
  { at: 45, text: "Setting tesserae patterns & alignment..." },
  { at: 70, text: "Applying grout lines & finish..." },
  { at: 88, text: "Rendering 8K architectural lighting..." },
];

export function GenerationWorkingScreen({
  prompt,
  placement,
  roomPhotoUrl,
  roomPhotoName,
  finish = "Polished High-Gloss",
  groutColor = "Champagne Gold",
  isGenerating = true,
  result,
  onCancel,
  onDownload,
  onRequestQuote,
  onRequestSpecialist,
  onBackToStudio,
}: GenerationWorkingScreenProps) {
  const [progress, setProgress] = useState(8);
  const [currentStageText, setCurrentStageText] = useState("Laying the tiles...");

  useEffect(() => {
    if (result) {
      setProgress(100);
      setCurrentStageText("Artisan surface render complete!");
      return;
    }

    const startTime = Date.now();
    const duration = 42000; // Target ~42-45 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Exponential decay easing so it rapidly reaches ~30-40% then steadily climbs to ~94%
      const raw = Math.min(94, Math.round(100 * (1 - Math.exp(-elapsed / (duration * 0.45)))));
      const nextProgress = Math.max(8, raw);
      setProgress(nextProgress);

      // Determine current stage
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (nextProgress >= STAGES[i].at) {
          setCurrentStageText(STAGES[i].text);
          break;
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-4 animate-fadeIn">
      {/* Top Header Section: Working Headline + Progress Card / Completed Image Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Headline & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3.5">
            {result ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                  • ARTISAN RENDER COMPLETE
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                  • WORKING
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              {result ? "Your Bespoke Mosaic Surface" : "Bringing your vision to life..."}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 italic font-serif leading-relaxed line-clamp-3 bg-obsidian-900/60 p-4 rounded-2xl border border-gold-500/15">
              &ldquo;{result?.promptApplied || prompt}&rdquo;
            </p>
          </div>

          {/* If Result Ready: Show Immediate Actions on Left */}
          {result ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onDownload}
                className="py-3 px-5 rounded-xl font-serif font-bold text-xs bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-obsidian-950" />
                Download High-Resolution Image
              </button>

              <button
                type="button"
                onClick={onRequestQuote}
                className="py-3 px-4 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 text-xs font-serif font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Request Sample Box
              </button>

              <button
                type="button"
                onClick={onRequestSpecialist}
                className="py-3 px-4 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-serif font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-gold-400" /> Specialist
              </button>

              {onBackToStudio && (
                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="py-3 px-4 rounded-xl bg-transparent hover:bg-obsidian-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Editor
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
              <span>Synthesizing Italian marble & smalti tesserae...</span>
            </div>
          )}
        </div>

        {/* Right Card: Shimmer While Loading -> High-Res Mosaic Image When Done */}
        <div className="lg:col-span-5 relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-gold-500/40 shadow-2xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-neutral-900 flex flex-col justify-end">
          {result ? (
            /* COMPLETED STATE: Generated Image Rendered Right Where It Loaded! */
            <div className="relative w-full h-full group">
              <Image
                src={result.resultImageUrl}
                alt="Generated Mosaic Surface"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/95 via-transparent to-black/40 pointer-events-none" />

              {/* Top Action Bar Over Image */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Complete • 100%
                </span>

                <button
                  type="button"
                  onClick={onDownload}
                  className="py-1.5 px-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-gold-500/30 transition-all hover:scale-105 cursor-pointer"
                  title="Download High-Resolution Image"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              {/* Bottom Details Bar Over Image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs z-10">
                <span className="text-white font-serif font-semibold text-sm drop-shadow-md">
                  {placement}
                </span>
                <span className="text-[11px] font-mono text-gold-300 font-bold bg-obsidian-900/80 px-2.5 py-0.5 rounded-md border border-gold-500/20">
                  {result.estimatedSqFt} sq.ft
                </span>
              </div>
            </div>
          ) : (
            /* LOADING STATE: Shimmering Mosaic Ambient Tile Backdrop */
            <>
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <div className="absolute inset-0 bg-[radial-gradient(#CBA741_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/70 to-transparent" />
              </div>

              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

              {/* Floating Progress Details */}
              <div className="relative z-10 p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-serif font-semibold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    {currentStageText}
                  </span>
                  <span className="text-base font-mono font-bold text-gold-300">
                    {progress}%
                  </span>
                </div>

                {/* Glowing Gold Progress Bar */}
                <div className="w-full h-2 rounded-full bg-obsidian-950 border border-neutral-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-amber-300 shadow-[0_0_12px_rgba(203,167,65,0.6)] transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400 font-mono tracking-wider">
                  <span>USUALLY READY IN ABOUT 45 SECONDS</span>
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-neutral-500 hover:text-neutral-300 underline transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Context Card: Space Reference / Architectural Estimation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-6">
        {result ? (
          /* RESULT READY: Show Material Estimation & Reference Space Side-by-Side */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Col: Space Reference / Concept Info */}
            <div className="lg:col-span-5 flex flex-col gap-3 pb-5 lg:pb-0 lg:border-r border-neutral-800 lg:pr-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Architectural Space Reference
              </span>

              {roomPhotoUrl ? (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-obsidian-950 border border-neutral-800">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold-500/30 bg-obsidian-900 shrink-0">
                    <Image src={roomPhotoUrl} alt="Reference Space" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-white truncate">
                      {roomPhotoName || "Room Photo"}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Target: {placement}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✓ Inpainting Applied
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white">Generative Concept Studio</span>
                  <span className="text-[11px] text-neutral-400 font-mono">Target Surface: {placement}</span>
                </div>
              )}
            </div>

            {/* Right Col: 3 Architectural Material Breakdown Cards */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5" /> Architectural Material Estimation
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider font-mono">Estimated Area</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-white">{result.estimatedSqFt} sq.ft</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider font-mono">Mosaic Chips</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-white">{result.estimatedTileCount.toLocaleString()}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-gold-500/30 text-center">
                  <span className="text-[10px] text-gold-400 block mb-1 uppercase tracking-wider font-mono">Material Cost</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-white">${result.estimatedMaterialCost.toLocaleString()}</span>
                </div>
              </div>

              <span className="text-[10px] text-neutral-500 font-mono">
                *Includes precision waterjet cut tesserae, fiberglass mesh mounting, and bespoke wooden crating.
              </span>
            </div>
          </div>
        ) : (
          /* LOADING STATE: Space reference + prompt + placement display */
          <>
            {roomPhotoUrl ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gold-500/30 bg-obsidian-950 shrink-0 shadow-lg">
                    <Image
                      src={roomPhotoUrl}
                      alt="Reference Space"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {roomPhotoName || "custom-reference-space.jpg"}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Custom Architectural Reference
                    </span>
                    <span className="text-[11px] text-gold-400/90 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                      Used only to render this preview. Not stored.
                    </span>
                  </div>
                </div>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs font-mono font-semibold tracking-wider text-neutral-400 hover:text-gold-300 transition-colors uppercase cursor-pointer"
                  >
                    REPLACE
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Imagine From Scratch Studio
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Pure architectural mosaic art formulation
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt line */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                Active Vision Prompt:
              </span>
              <p className="text-xs sm:text-sm text-neutral-200">
                {prompt}
              </p>
            </div>

            {/* WHERE SHOULD IT GO? Placement Selector Display */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                  WHERE SHOULD IT GO?
                </span>
                <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {PLACEMENT_OPTIONS.map((opt) => {
                  const isActive =
                    placement.toLowerCase().includes(opt.toLowerCase()) ||
                    opt.toLowerCase().includes(placement.toLowerCase());

                  return (
                    <div
                      key={opt}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gold-500 text-obsidian-950 font-bold border border-gold-400 shadow-md shadow-gold-500/20"
                          : "bg-obsidian-950/80 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
