"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, Clock, Layers, ArrowRight, Loader2, RefreshCw } from "lucide-react";

interface GenerationItem {
  id: string;
  prompt: string;
  placement: string;
  resultImageUrl: string;
  createdAt: string;
}

interface MyGenerationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSelectGeneration?: (gen: GenerationItem) => void;
}

export function MyGenerationsModal({
  isOpen,
  onClose,
  email,
  onSelectGeneration,
}: MyGenerationsModalProps) {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && email) {
      fetchHistory();
    }
  }, [isOpen, email]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/my-generations?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history");
      setGenerations(data.generations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load generations");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-lg sm:text-xl">
                My Generations
              </h2>
              <p className="text-xs text-neutral-400">
                Recent mosaic designs created for{" "}
                <span className="text-gold-300 font-semibold">{email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHistory}
              disabled={isLoading}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 transition-colors"
              title="Refresh history"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[55vh]">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
              <span className="text-xs font-mono">Loading your recent designs...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 text-xs">
              {error}
            </div>
          ) : generations.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <Layers className="w-10 h-10 text-neutral-600 mb-1" />
              <p className="text-sm font-semibold text-neutral-300">
                No generations yet
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Enter your prompt in the studio to render your first bespoke architectural mosaic design.
              </p>
            </div>
          ) : (
            generations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-obsidian-950/70 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gold-500/20 bg-obsidian-900 shrink-0">
                    <Image
                      src={item.resultImageUrl}
                      alt={item.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
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
                      "{item.prompt}"
                    </p>
                  </div>
                </div>

                {onSelectGeneration && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectGeneration(item);
                      onClose();
                    }}
                    className="self-end sm:self-center px-4 py-2 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 text-gold-300 border border-gold-500/30 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    Load in Studio
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-3 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Total Generations: <strong className="text-white">{generations.length} / 5 used</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
