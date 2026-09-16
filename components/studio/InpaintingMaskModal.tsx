"use client";

import React, { useEffect } from "react";
import { X, Check, Paintbrush, Sparkles } from "lucide-react";
import { CanvasDraw, CanvasDrawRef } from "./CanvasDraw";

interface InpaintingMaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<CanvasDrawRef>;
  onImageUploaded?: (hasImage: boolean, previewUrl?: string) => void;
  onMaskDrawn?: () => void;
}

export function InpaintingMaskModal({
  isOpen,
  onClose,
  canvasRef,
  onImageUploaded,
  onMaskDrawn,
}: InpaintingMaskModalProps) {
  // Whenever the modal opens, notify canvas to update its sizing to the container
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        canvasRef.current?.resizeCanvas?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, canvasRef]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md transition-all duration-200 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl flex flex-col gap-4">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-3">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest w-fit">
              <Paintbrush className="w-3.5 h-3.5" /> Target Space Boundary
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              Room Photo & Inpainting Mask Tool
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              Use the mask brush to paint gold over the surface area (floor, rotunda, backsplash, or accent wall) where you want the AI mosaic surface embedded.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-obsidian-800 hover:bg-obsidian-700 text-neutral-400 hover:text-white transition-colors border border-neutral-700 shrink-0"
            title="Close Mask Tool"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="w-full">
          <CanvasDraw
            ref={canvasRef}
            onImageUploaded={onImageUploaded}
            onMaskDrawn={onMaskDrawn}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800 flex-wrap gap-3">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Gold area indicates where the custom mosaic will be generated.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs font-semibold transition-all border border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Save Mask & Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
