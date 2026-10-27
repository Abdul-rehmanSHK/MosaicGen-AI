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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-200/70 border border-stone-300 text-stone-700 text-xs font-semibold uppercase tracking-widest shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-stone-600" /> Handcrafted Masterpieces
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-stone-900">
          The <span className="italic font-normal">Zakiah Mosaics</span> Portfolio
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl text-center">
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
            className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 break-inside-avoid shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-stone-400 transition-all duration-300 cursor-pointer flex flex-col mb-6"
          >
            {/* Image Container with zoom and badges */}
            <div className="relative w-full aspect-auto overflow-hidden bg-stone-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {item.pricePerSqFt ? (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 font-serif font-bold text-[11px] shadow-sm">
                  ${item.pricePerSqFt}/sq.ft
                </div>
              ) : null}
            </div>

            {/* Product Card Details */}
            <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1 justify-between bg-white border-t border-stone-100">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                    {item.category || "Bespoke Mosaic"}
                  </span>
                </div>

                <h3 className="text-base font-serif font-semibold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
                  {item.title}
                </h3>

                {item.desc && (
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                    {item.desc}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 group-hover:bg-stone-900 text-stone-800 group-hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-stone-200 group-hover:border-stone-900 shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-500 group-hover:text-white transition-colors" />
                  Try this design
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
