"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Loader2,
  Download,
  CheckCircle2,
  FileText,
  RefreshCw,
  MessageSquare,
  Grid,
  Sparkles,
} from "lucide-react";

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
  onSelectPlacement?: (newPlacement: string) => void;
  onReplacePhoto?: () => void;
}

const PLACEMENT_OPTIONS = [
  "Auto-detect",
  "Backsplash",
  "Accent wall",
  "Floor medallion",
  "Pool",
  "Entryway",
];

const GENERATION_STAGES = [
  {
    at: 0,
    heading: "Analyzing your architectural space...",
    cardStage: "Analyzing architectural space...",
    subdetail: "Scanning perspective planes, room depth, and focal illumination...",
  },
  {
    at: 18,
    heading: "Selecting Italian marble & tesserae...",
    cardStage: "Synthesizing marble & smalti...",
    subdetail: "Extracting Calacatta, Nero Marquina, and 24k gold leaf tesserae...",
  },
  {
    at: 38,
    heading: "Laying the tiles...",
    cardStage: "Laying the tiles...",
    subdetail: "Positioning each hand-cut mosaic chip in true architectural perspective...",
  },
  {
    at: 60,
    heading: "Setting tesserae patterns & alignment...",
    cardStage: "Setting tesserae patterns & alignment...",
    subdetail: "Harmonizing geometric geometry, borders, and medallion symmetry...",
  },
  {
    at: 78,
    heading: "Applying artisanal grout & surface finish...",
    cardStage: "Applying grout lines & finish...",
    subdetail: "Infusing luminous grout lines with polished satin-honed luster...",
  },
  {
    at: 90,
    heading: "Rendering 8K architectural lighting...",
    cardStage: "Rendering 8K architectural lighting...",
    subdetail: "Finalizing ambient reflections, depth shadows, and master craft aesthetics...",
  },
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
  onSelectPlacement,
  onReplacePhoto,
}: GenerationWorkingScreenProps) {
  const [progress, setProgress] = useState(8);
  const [currentStage, setCurrentStage] = useState(GENERATION_STAGES[0]);

  useEffect(() => {
    if (result) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const duration = 42000; // Target ~42-45 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const raw = Math.min(94, Math.round(100 * (1 - Math.exp(-elapsed / (duration * 0.45)))));
      const nextProgress = Math.max(8, raw);
      setProgress(nextProgress);

      for (let i = GENERATION_STAGES.length - 1; i >= 0; i--) {
        if (nextProgress >= GENERATION_STAGES[i].at) {
          setCurrentStage(GENERATION_STAGES[i]);
          break;
        }
      }
    }, 350);

    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-4 animate-fadeIn">
      {/* Top Header Section: Left Column (Status & Actions) + Right Column (Progress / Completed Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6 py-2">
          {result ? (
            /* COMPLETED STATE */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono tracking-widest text-emerald-700 uppercase font-bold">
                    • ARTISAN RENDER COMPLETE
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                  Bring this design to life
                </h1>

                <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg">
                  Reimagine it, refine it, then get a quote. We&apos;ll turn your vision into a custom mosaic—from design to fabrication and installation.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="py-3.5 px-6 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-stone-950 active:scale-[0.99] transition-all shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-stone-950" />
                  Get a quote for this
                </button>

                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="py-3.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
                  Reimagine
                </button>

                <button
                  type="button"
                  onClick={onRequestSpecialist}
                  className="py-3.5 px-5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Speak to specialist
                </button>
              </div>
            </div>
          ) : (
            /* LOADING STATE: Heading Changes One-by-One As AI Generates */
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-stone-600 uppercase font-bold">
                  • WORKING
                </span>
              </div>

              {/* Dynamic Animated Heading */}
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight min-h-[3.5rem] transition-all duration-500 ease-out">
                {currentStage.heading}
              </h1>

              {/* User Prompt Quote */}
              <p className="text-xs sm:text-sm text-stone-700 italic font-serif leading-relaxed line-clamp-3 bg-white p-4 rounded-2xl border border-gold-400/30 shadow-2xs">
                &ldquo;{prompt}&rdquo;
              </p>

              {/* Live Subdetail */}
              <div className="text-xs text-stone-600 font-mono flex items-center gap-2 pt-1 font-medium">
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                <span>{currentStage.subdetail}</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
          {result ? (
            /* COMPLETED STATE: Generated Image + 3-Button Action Bar */
            <>
              <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl bg-stone-900 group">
                <img
                  src={result.resultImageUrl}
                  alt="Generated Bespoke Mosaic Surface"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/mosaic-finder-pattern.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-black/10 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Complete
                  </span>
                  <span className="text-[11px] font-mono text-gold-300 font-bold bg-stone-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30 shadow-sm">
                    {result.estimatedSqFt} sq.ft
                  </span>
                </div>
              </div>

              {/* Bottom Button Bar: [ Download ] [ Get a quote ] [ Reimagine ] */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDownload}
                  className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-gold-400 border border-stone-800 transition-all hover:scale-105 cursor-pointer shadow-sm"
                  title="Download High-Resolution Image"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="flex-1 py-3 px-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-gold-500/20"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-950" />
                  Get a quote
                </button>

                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="flex-1 py-3 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white border border-stone-800 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
                  Reimagine
                </button>
              </div>
            </>
          ) : (
            /* LOADING STATE: Ambient Backdrop Card with Progress Bar */
            <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-gold-400/40 shadow-xl bg-gradient-to-br from-stone-900 via-stone-950 to-neutral-900 flex flex-col justify-end">
              {/* Shimmer Ambient Backdrop */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <div className="absolute inset-0 bg-[radial-gradient(#CBA741_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
              </div>

              {/* Shimmer sweep animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

              {/* Floating Progress Details */}
              <div className="relative z-10 p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-serif font-semibold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    {currentStage.cardStage}
                  </span>
                  <span className="text-base font-mono font-bold text-gold-300">
                    {progress}%
                  </span>
                </div>

                {/* Glowing Gold Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone-950 border border-stone-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-amber-300 shadow-[0_0_12px_rgba(203,167,65,0.6)] transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 font-mono tracking-wider">
                  <span>USUALLY READY IN ABOUT 45 SECONDS</span>
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-stone-400 hover:text-white underline transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM CONTEXT CARD ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xl flex flex-col gap-6 text-stone-900">
        {/* Space Reference Row */}
        {roomPhotoUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-sm">
                <Image
                  src={roomPhotoUrl}
                  alt="Reference Space"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-semibold text-stone-900 truncate max-w-xs sm:max-w-md">
                  {roomPhotoName || "custom-reference-space.jpg"}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Custom Architectural Reference
                </span>
                <span className="text-[11px] text-amber-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Used only to render this preview. Not stored.
                </span>
              </div>
            </div>

            {(onReplacePhoto || onBackToStudio) && (
              <button
                type="button"
                onClick={onReplacePhoto || onBackToStudio}
                className="text-xs font-mono font-semibold tracking-wider text-stone-600 hover:text-stone-900 transition-colors uppercase cursor-pointer"
              >
                REPLACE
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Imagine From Scratch Studio
                </span>
                <span className="text-[11px] text-stone-500">
                  Pure architectural mosaic art formulation
                </span>
              </div>
            </div>
            {onBackToStudio && (
              <button
                type="button"
                onClick={onBackToStudio}
                className="text-xs font-mono font-semibold tracking-wider text-stone-600 hover:text-stone-900 transition-colors uppercase cursor-pointer"
              >
                CHANGE PROMPT
              </button>
            )}
          </div>
        )}

        {/* Active Prompt Row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider font-mono font-semibold">
            Active Vision Prompt:
          </span>
          <p className="text-xs sm:text-sm text-stone-800 font-serif italic leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
            &ldquo;{result?.promptApplied || prompt}&rdquo;
          </p>
        </div>

        {/* WHERE SHOULD IT GO? Placement Selector Display */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-bold">
              WHERE SHOULD IT GO?
            </span>
            {!result && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {PLACEMENT_OPTIONS.map((opt) => {
              const isActive =
                placement.toLowerCase().includes(opt.toLowerCase()) ||
                opt.toLowerCase().includes(placement.toLowerCase());

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelectPlacement?.(opt)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-stone-900 text-white font-bold border border-stone-900 shadow-xs scale-105"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* If Result Ready: Show Material Estimation Cards */}
        {result && (
          <div className="pt-5 border-t border-stone-100 flex flex-col gap-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-amber-600" /> Architectural Material Estimation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center shadow-2xs">
                <span className="text-[10px] text-stone-500 block mb-1 uppercase tracking-wider font-mono font-semibold">
                  Estimated Area
                </span>
                <span className="text-base sm:text-xl font-serif font-bold text-stone-900">
                  {result.estimatedSqFt} sq.ft
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center shadow-2xs">
                <span className="text-[10px] text-stone-500 block mb-1 uppercase tracking-wider font-mono font-semibold">
                  Mosaic Chips
                </span>
                <span className="text-base sm:text-xl font-serif font-bold text-stone-900">
                  {result.estimatedTileCount.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-300 text-center shadow-2xs">
                <span className="text-[10px] text-amber-800 block mb-1 uppercase tracking-wider font-mono font-bold">
                  Material Cost
                </span>
                <span className="text-base sm:text-xl font-serif font-bold text-amber-900">
                  ${result.estimatedMaterialCost.toLocaleString()}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-stone-500 font-mono">
              *Includes precision waterjet cut tesserae, fiberglass mesh mounting, and bespoke wooden crating.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
