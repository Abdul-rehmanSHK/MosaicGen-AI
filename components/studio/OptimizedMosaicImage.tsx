"use client";

import React, { useState } from "react";
import Image from "next/image";

interface OptimizedMosaicImageProps {
  src: string;
  alt: string;
  title?: string;
  category?: string;
  pricePerSqFt?: number;
  isHero?: boolean;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
  sizes?: string;
}

/**
 * Base64 micro-shimmer SVG placeholder for luxury mosaic textures.
 * Provides an instant elegant gold-sheen blur before the high-res texture completes loading.
 */
const GOLD_SHIMMER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTIxMjE2Ii8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvZGVmcz48L3N2Zz4=";

export function OptimizedMosaicImage({
  src,
  alt,
  title,
  category,
  pricePerSqFt,
  isHero = false,
  className = "",
  aspectRatio = "square",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: OptimizedMosaicImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : "aspect-[16/9]";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-obsidian-950 border border-gold-500/20 shadow-xl transition-all duration-500 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/10 ${aspectClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt || "Handcrafted Architectural Mosaic Surface"}
        fill
        // 1. High Priority for above-the-fold Hero showcases to maximize Core Web Vitals (LCP)
        priority={isHero}
        // 2. Responsive sizes prevents loading oversized assets on mobile viewports
        sizes={sizes}
        // 3. Instant Blur Placeholder avoids Layout Shifts (CLS)
        placeholder="blur"
        blurDataURL={GOLD_SHIMMER_BLUR}
        onLoad={() => setIsLoading(false)}
        className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          isLoading ? "scale-105 blur-lg grayscale" : "scale-100 blur-0 grayscale-0"
        }`}
      />

      {/* Luxury Vignette & Spec Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4">
        {title && (
          <h4 className="font-serif font-bold text-sm text-white drop-shadow-md">
            {title}
          </h4>
        )}
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-gold-300">
          {category && <span>{category}</span>}
          {pricePerSqFt && (
            <span className="font-bold bg-obsidian-900/90 px-2 py-0.5 rounded border border-gold-500/30">
              ${pricePerSqFt}/sq.ft
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default OptimizedMosaicImage;
