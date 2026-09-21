"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function MosaicFinderBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto my-16 px-2">
      {/* Editorial Decorative Sparkle Divider */}
      <div className="flex items-center justify-center gap-4 mb-12 opacity-80">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500/30 to-gold-500/60" />
        <span className="text-gold-400 text-xs font-serif tracking-[0.4em]">✦</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent via-gold-500/30 to-gold-500/60" />
      </div>

      {/* Banner Card Container */}
      <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-obsidian-900/90 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl px-6 py-12 sm:px-10 sm:py-16 text-center group">
        {/* Geometric Mosaic Floor Pattern Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/mosaic-finder-pattern.png"
            alt="Mosaic Geometric Floor Pattern"
            fill
            className="object-cover opacity-30 transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
          {/* Subtle Radial & Linear Contrast Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/80 via-obsidian-950/60 to-obsidian-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,11,15,0.7)_80%)]" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto gap-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-gold-400 font-semibold drop-shadow-sm">
            Curated Architectural Design
          </p>

          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white drop-shadow-md">
            Discover Your <em className="italic font-serif text-gold-400 font-normal">Signature Aesthetic</em>
          </h3>

          <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-neutral-300 drop-shadow-sm">
            Answer five concise design preferences and our studio curator will formulate an original bespoke mosaic concept tailored to your architectural space.
          </p>

          <Link
            href="/finder"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-gold-400/40 bg-obsidian-950/80 hover:bg-gold-500 text-gold-300 hover:text-obsidian-950 px-7 text-[12px] uppercase tracking-[0.18em] font-bold backdrop-blur-md transition-all duration-300 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start the Aesthetic Finder</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
