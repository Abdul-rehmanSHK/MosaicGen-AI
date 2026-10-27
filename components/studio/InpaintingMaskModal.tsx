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
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-md transition-all duration-200 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col gap-4 text-stone-900">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono font-bold uppercase tracking-widest w-fit">
              <Paintbrush className="w-3.5 h-3.5 text-stone-500" /> Target Space Boundary
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              Room Photo & Inpainting Mask Tool
            </h2>
            <p className="text-xs text-stone-500 max-w-xl">
              Use the mask brush to paint gold over the surface area (floor, rotunda, backsplash, or accent wall) where you want the AI mosaic surface embedded.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors border border-stone-200 shrink-0"
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
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 flex-wrap gap-3">
          <span className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gold area indicates where the custom mosaic will be generated.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all border border-stone-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-xs bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
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
