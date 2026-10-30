"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Layers, Sparkles, ExternalLink, ArrowRight } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
    >
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col gap-6 animate-scaleUp text-stone-900">
        {/* Subtle Ambient Gold Glow Accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge & Header */}
        <div className="flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold uppercase tracking-wider w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Complimentary Previews Limit
          </div>

          <h2 id="limit-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            5 Free Previews Utilized
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            You have reached the maximum limit of <strong className="text-stone-900 font-semibold">5 complimentary architectural previews</strong> for{" "}
            <span className="font-mono font-semibold text-amber-950 bg-amber-50/90 border border-amber-200 px-2 py-0.5 rounded break-all">
              {email || "this email address"}
            </span>.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-col gap-2.5 text-xs text-stone-600 leading-relaxed shadow-2xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>How to continue exploring mosaic designs:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-stone-700 pl-1">
            <li>
              Switch to a <strong className="text-stone-900 font-semibold">different client, firm, or partner email</strong> to unlock 5 fresh previews.
            </li>
            <li>
              Review or download your <strong className="text-stone-900 font-semibold">5 existing renders</strong> from your portfolio history.
            </li>
            <li>
              Commission custom bespoke concepts with our master architectural mosaicists.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Primary Action: Use a Different Email */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onUseDifferentEmail();
            }}
            className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs sm:text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-stone-950 flex items-center justify-center gap-2.5 shadow-md shadow-gold-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-stone-950" />
            <span>Use a Different Email Address</span>
            <ArrowRight className="w-4 h-4 text-stone-950 ml-auto" />
          </button>

          {/* Secondary Action: View Existing Generations */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewGenerations();
            }}
            className="w-full py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-gold-400" />
            <span>View & Download My 5 Generations</span>
          </button>

          {/* Specialist Consultation External Link */}
          <a
            href="https://zakiahmarble.com/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 text-center text-xs text-stone-500 hover:text-stone-900 transition-colors flex items-center justify-center gap-1.5"
          >
            Speak to a Specialist for Bespoke Projects <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
