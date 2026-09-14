"use client";

import React from "react";
import { inspirationData } from "@/lib/inspirationData";
import { Sparkles, Tag } from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  description?: string;
  sampleImageUrl: string;
  pricePerSqFt?: number;
  category?: string;
}

interface InspirationGalleryProps {
  products?: ProductItem[];
  onSelectPrompt: (prompt: string, productId?: string) => void;
}

export function InspirationGallery({ products, onSelectPrompt }: InspirationGalleryProps) {
  // Use active products from catalog if available, fallback to seed inspirations
  const displayItems = (products && products.length > 0)
    ? products.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.sampleImageUrl,
        desc: p.description,
        category: p.category,
        pricePerSqFt: p.pricePerSqFt,
      }))
    : inspirationData.map((item, idx) => ({
        id: `seed-${idx}`,
        title: item.title,
        image: item.image,
        desc: item.desc,
        category: "Bespoke Mosaic",
        pricePerSqFt: undefined,
      }));

  return (
    <div className="w-full mt-8">
      <div className="text-center mb-10 flex flex-col items-center gap-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-gold-400 font-semibold">
          Selected Works & Product Catalog
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
          A portfolio of <em className="italic text-gold-400 font-normal">hand-crafted</em> mosaics
        </h2>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          From private residences to landmark commissions—tap any piece to see it up close, or make something like it for your own space.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-obsidian-900 border border-neutral-800 break-inside-avoid shadow-lg transition-all duration-300 hover:border-gold-500/40 hover:shadow-2xl hover:shadow-gold-500/10"
          >
            <div className="relative w-full aspect-auto">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/95 via-obsidian-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-semibold truncate">
                    {item.category || "MOSAIC"}
                  </span>
                  {item.pricePerSqFt && (
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-obsidian-950/80 px-2 py-0.5 rounded border border-gold-500/30">
                      ${item.pricePerSqFt}/sq.ft
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-serif font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-neutral-300 line-clamp-3 mb-4 leading-relaxed">{item.desc}</p>
                
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPrompt(item.desc || item.title, item.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98] cursor-pointer"
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
