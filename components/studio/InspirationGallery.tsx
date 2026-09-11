"use client";

import React from "react";
import Image from "next/image";
import { inspirationData } from "@/lib/inspirationData";
import { Sparkles } from "lucide-react";

interface InspirationGalleryProps {
  onSelectPrompt: (prompt: string) => void;
}

export function InspirationGallery({ onSelectPrompt }: InspirationGalleryProps) {
  return (
    <div className="w-full mt-8">
      <div className="text-center mb-10 flex flex-col items-center gap-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-gold-400 font-semibold">
          Selected Works
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
          A portfolio of <em className="italic text-gold-400 font-normal">hand-crafted</em> mosaics
        </h2>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          From private residences to landmark commissions—tap any piece to see it up close, or make something like it for your own space.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {inspirationData.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl overflow-hidden bg-obsidian-900 border border-neutral-800 break-inside-avoid shadow-lg"
          >
            <div className="relative w-full aspect-auto">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-sm font-serif font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-neutral-300 line-clamp-3 mb-4">{item.desc}</p>
                
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPrompt(item.desc);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-gold-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Try something like this
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
