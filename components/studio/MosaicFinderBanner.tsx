"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function MosaicFinderBanner() {
  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-2">
      {/* Editorial Decorative Slider Indicator (matching Screenshot 3) */}
      <div className="flex items-center justify-center gap-3 mb-10 opacity-60">
        <div className="h-[1px] w-20 bg-stone-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone-800 inline-block" />
        <div className="h-[1px] w-20 bg-stone-300" />
      </div>

      {/* Banner Card Container */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] px-6 py-10 sm:px-10 sm:py-14 text-center group">
        {/* Geometric Mosaic Floor Pattern Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/mosaic-finder-pattern.png"
            alt="Mosaic Geometric Floor Pattern"
            fill
            className="object-cover opacity-25 transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
          {/* Subtle Clean Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/90" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto gap-2.5">
          <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-stone-500 font-bold">
            NOT SURE WHERE TO START?
          </p>

          <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
            Try the <em className="italic font-serif font-normal">Mosaic Finder</em>
          </h3>

          <p className="mt-1 max-w-md text-xs sm:text-sm leading-relaxed text-stone-600">
            Answer five concise design preferences and our studio curator will formulate an original bespoke mosaic concept tailored to your architectural space.
          </p>

          <Link
            href="/finder"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-stone-300 bg-white hover:bg-stone-900 text-stone-900 hover:text-white px-7 text-[12px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start the Aesthetic Finder</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
