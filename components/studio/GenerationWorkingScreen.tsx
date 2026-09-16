"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Loader2 } from "lucide-react";

interface GenerationWorkingScreenProps {
  prompt: string;
  placement: string;
  roomPhotoUrl: string | null;
  roomPhotoName: string | null;
  finish?: string;
  groutColor?: string;
  onCancel?: () => void;
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
  onCancel,
}: GenerationWorkingScreenProps) {
  const [progress, setProgress] = useState(8);
  const [currentStageText, setCurrentStageText] = useState("Laying the tiles...");

  useEffect(() => {
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
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 py-6 animate-fadeIn">
      {/* Top Header Section: Working Headline + Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
              • WORKING
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Bringing your vision to life...
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 italic font-serif leading-relaxed line-clamp-3 bg-obsidian-900/60 p-4 rounded-2xl border border-gold-500/15">
            "{prompt}"
          </p>
        </div>

        {/* Right Animated Tile Shimmer Progress Card */}
        <div className="lg:col-span-5 relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border border-gold-500/30 shadow-2xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-neutral-900 p-6 flex flex-col justify-end">
          {/* Shimmering Mosaic Ambient Tile Backdrop */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(#CBA741_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/70 to-transparent" />
          </div>

          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

          {/* Floating Progress Details */}
          <div className="relative z-10 flex flex-col gap-3">
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
                  className="text-neutral-500 hover:text-neutral-300 underline transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Context Card: Space Reference + Placement Pills */}
      <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-6">
        {/* Uploaded image details if available */}
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
                className="text-xs font-mono font-semibold tracking-wider text-neutral-400 hover:text-gold-300 transition-colors uppercase"
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
            <span className="text-xs text-neutral-400 font-mono">
              {finish} • {groutColor}
            </span>
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
      </div>
    </div>
  );
}
