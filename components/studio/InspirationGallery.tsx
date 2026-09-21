"use client";

import React from "react";
import { inspirationData } from "@/lib/inspirationData";
import { Sparkles } from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  description?: string;
  sampleImageUrl: string;
  pricePerSqFt?: number;
  category?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  desc?: string;
  category?: string;
  pricePerSqFt?: number;
}

interface InspirationGalleryProps {
  products?: ProductItem[];
  onSelectPrompt?: (prompt: string, productId?: string) => void;
  onSelectDesign?: (item: GalleryItem) => void;
}

export function InspirationGallery({ products, onSelectPrompt, onSelectDesign }: InspirationGalleryProps) {
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
      <div className="text-center mb-10 flex flex-col items-center gap-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
          <Sparkles className="w-3.5 h-3.5" /> Handcrafted Masterpieces
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
          The <span className="italic text-gold-400 font-normal">Zakiah Mosaics</span> Portfolio
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl text-center">
          A curated portfolio of bespoke architectural mosaic installations handcrafted in authentic Italian marble, Venetian smalti, and 24k gold leaf.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (onSelectDesign) {
                onSelectDesign(item);
              }
              if (onSelectPrompt) {
                onSelectPrompt(item.desc || item.title, item.id);
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative rounded-2xl overflow-hidden bg-obsidian-900 border border-neutral-800 break-inside-avoid shadow-lg transition-all duration-300 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/10 cursor-pointer"
          >
            <div className="relative w-full aspect-auto">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-sm sm:text-base font-serif font-semibold text-white mb-2.5 text-center drop-shadow-md">
                  {item.title}
                </h3>
                
                <div className="w-full">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Try this design
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
