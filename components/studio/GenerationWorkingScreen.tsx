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
            /* COMPLETED STATE (Matching Reference Design) */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                    • ARTISAN RENDER COMPLETE
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  Bring this design to life
                </h1>

                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
                  Reimagine it, refine it, then get a quote. We&apos;ll turn your vision into a custom mosaic—from design to fabrication and installation.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="py-3.5 px-6 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-obsidian-950" />
                  Get a quote for this
                </button>

                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="py-3.5 px-5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-white border border-neutral-700 hover:border-gold-500/40 text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
                  Reimagine
                </button>

                <button
                  type="button"
                  onClick={onRequestSpecialist}
                  className="py-3.5 px-5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-gold-500/40 text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                  Speak to specialist
                </button>
              </div>
            </div>
          ) : (
            /* LOADING STATE: Heading Changes One-by-One As AI Generates */
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                  • WORKING
                </span>
              </div>

              {/* Dynamic Animated Heading */}
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight min-h-[3.5rem] transition-all duration-500 ease-out">
                {currentStage.heading}
              </h1>

              {/* User Prompt Quote */}
              <p className="text-xs sm:text-sm text-neutral-300 italic font-serif leading-relaxed line-clamp-3 bg-obsidian-900/60 p-4 rounded-2xl border border-gold-500/15">
                &ldquo;{prompt}&rdquo;
              </p>

              {/* Live Subdetail */}
              <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 pt-1">
                <Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin shrink-0" />
                <span className="text-neutral-300">{currentStage.subdetail}</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
          {result ? (
            /* COMPLETED STATE: Generated Image + 3-Button Action Bar (Matching Reference) */
            <>
              <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-gold-500/40 shadow-2xl bg-obsidian-950 group">
                <Image
                  src={result.resultImageUrl}
                  alt="Generated Bespoke Mosaic Surface"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Complete
                  </span>
                  <span className="text-[11px] font-mono text-gold-300 font-bold bg-obsidian-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30">
                    {result.estimatedSqFt} sq.ft
                  </span>
                </div>
              </div>

              {/* Bottom Button Bar: [ ↓ ] [ Get a quote ] [ Reimagine ] */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDownload}
                  className="p-3 rounded-xl bg-obsidian-900 hover:bg-gold-500/20 text-gold-400 hover:text-gold-300 border border-gold-500/30 transition-all hover:scale-105 cursor-pointer shadow-md"
                  title="Download High-Resolution Image"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="flex-1 py-3 px-3.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-white border border-neutral-700 hover:border-gold-500/40 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <FileText className="w-3.5 h-3.5 text-gold-400" />
                  Get a quote
                </button>

                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="flex-1 py-3 px-3.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-gold-500/40 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
                  Reimagine
                </button>
              </div>
            </>
          ) : (
            /* LOADING STATE: Ambient Backdrop Card with Progress Bar */
            <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-gold-500/40 shadow-2xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-neutral-900 flex flex-col justify-end">
              {/* Shimmer Ambient Backdrop */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <div className="absolute inset-0 bg-[radial-gradient(#CBA741_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/70 to-transparent" />
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
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM CONTEXT CARD ================= */}
      {/* Displayed in both loading and completed states to match reference */}
      <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-6">
        {/* Space Reference Row */}
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

            {(onReplacePhoto || onBackToStudio) && (
              <button
                type="button"
                onClick={onReplacePhoto || onBackToStudio}
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
            {onBackToStudio && (
              <button
                type="button"
                onClick={onBackToStudio}
                className="text-xs font-mono font-semibold tracking-wider text-neutral-400 hover:text-gold-300 transition-colors uppercase cursor-pointer"
              >
                CHANGE PROMPT
              </button>
            )}
          </div>
        )}

        {/* Active Prompt Row */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
            Active Vision Prompt:
          </span>
          <p className="text-xs sm:text-sm text-neutral-200 font-serif italic">
            &ldquo;{result?.promptApplied || prompt}&rdquo;
          </p>
        </div>

        {/* WHERE SHOULD IT GO? Placement Selector Display */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              WHERE SHOULD IT GO?
            </span>
            {!result && <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />}
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
                      ? "bg-gold-500 text-obsidian-950 font-bold border border-gold-400 shadow-md shadow-gold-500/20 scale-105"
                      : "bg-obsidian-950/80 text-neutral-400 border border-neutral-800 hover:border-gold-500/40 hover:text-gold-300"
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
          <div className="pt-5 border-t border-neutral-800 flex flex-col gap-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" /> Architectural Material Estimation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider font-mono">
                  Estimated Area
                </span>
                <span className="text-base sm:text-lg font-serif font-bold text-white">
                  {result.estimatedSqFt} sq.ft
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider font-mono">
                  Mosaic Chips
                </span>
                <span className="text-base sm:text-lg font-serif font-bold text-white">
                  {result.estimatedTileCount.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-gold-500/30 text-center">
                <span className="text-[10px] text-gold-400 block mb-1 uppercase tracking-wider font-mono">
                  Material Cost
                </span>
                <span className="text-base sm:text-lg font-serif font-bold text-white">
                  ${result.estimatedMaterialCost.toLocaleString()}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-neutral-500 font-mono">
              *Includes precision waterjet cut tesserae, fiberglass mesh mounting, and bespoke wooden crating.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
