"use client";

import React, { useEffect } from "react";
import { X, Mail, Layers, AlertCircle, Sparkles, ExternalLink, ArrowRight } from "lucide-react";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onUseDifferentEmail: () => void;
  onViewGenerations: () => void;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  email,
  onUseDifferentEmail,
  onViewGenerations,
}: LimitReachedModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
    >
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl shadow-black/80 overflow-hidden flex flex-col gap-6 animate-scaleUp">
        {/* Ambient gold glow accent */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white hover:bg-obsidian-700 transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge & Header */}
        <div className="flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Free Preview Limit Reached
          </div>

          <h2 id="limit-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            5 Free Previews Utilized
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            You have reached the maximum limit of <strong className="text-white">5 complimentary architectural previews</strong> for{" "}
            <span className="text-gold-300 font-mono font-semibold break-all">{email || "this email address"}</span>.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-neutral-800 flex flex-col gap-2 text-xs text-neutral-400 leading-relaxed">
          <div className="flex items-center gap-2 text-gold-300 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
            <span>How to continue exploring mosaic designs:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-neutral-300 pl-1">
            <li>
              Switch to a <strong className="text-white">different client or firm email</strong> to unlock 5 fresh previews.
            </li>
            <li>
              Review or download your <strong className="text-white">5 existing renders</strong> from your history.
            </li>
            <li>
              Commission custom bespoke concepts with our master architectural mosaicists.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Primary Action: Use a Different Email */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onUseDifferentEmail();
            }}
            className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs sm:text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-obsidian-950" />
            <span>Use a Different Email Address</span>
            <ArrowRight className="w-4 h-4 text-obsidian-950 ml-auto" />
          </button>

          {/* Secondary Action: View Existing Generations */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewGenerations();
            }}
            className="w-full py-3 px-5 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 text-neutral-200 hover:text-gold-300 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-800 hover:border-gold-500/30 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-gold-400" />
            <span>View & Download My 5 Generations</span>
          </button>

          {/* Specialist Consultation External Link */}
          <a
            href="https://zakiahmarble.com/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-center text-xs text-neutral-400 hover:text-gold-300 transition-colors flex items-center justify-center gap-1.5 pt-1"
          >
            Speak to a Specialist for Bespoke Projects <ExternalLink className="w-3 h-3 text-gold-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
