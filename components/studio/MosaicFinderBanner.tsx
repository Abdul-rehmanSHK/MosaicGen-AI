"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Compass } from "lucide-react";

export function MosaicFinderBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto mt-6 mb-12 px-2">
      {/* Editorial Decorative Slider Indicator */}
      <div className="flex items-center justify-center gap-3 mb-10 opacity-60">
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-stone-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone-700 inline-block" />
        <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-stone-300" />
      </div>

      {/* Banner Card Container */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-[#f9f8f6] shadow-[0_8px_30px_rgba(0,0,0,0.04)] px-6 py-12 sm:px-12 sm:py-16 text-center group">
        {/* Geometric Mosaic Floor Pattern Background - Darker & Richer Texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/mosaic-finder-pattern-dark.png"
            alt="Mosaic Geometric Floor Pattern"
            fill
            className="object-cover opacity-65 transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
          {/* Subtle Contrast Vignette & Soft Center Glow for Crisp Typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/50 via-white/20 to-stone-100/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.45)_55%,transparent_85%)]" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-stone-200/90 text-stone-700 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase font-bold shadow-2xs backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-stone-600" />
            <span>Not Sure Where To Start?</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-stone-950">
            Try the <em className="italic font-serif font-normal">Mosaic Finder</em>
          </h3>

          <p className="mt-1 max-w-lg text-xs sm:text-sm leading-relaxed text-stone-700">
            Answer five concise design preferences and our studio curator will formulate an original bespoke mosaic concept tailored to your architectural space.
          </p>

          <Link
            href="/finder"
            className="mt-4 inline-flex h-12 items-center gap-2.5 rounded-full bg-stone-900 hover:bg-black text-white px-8 text-[12px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start the Aesthetic Finder</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
