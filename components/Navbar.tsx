"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Grid, Layers, Compass } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const isNavActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-950/90 backdrop-blur-xl border-b border-gold-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-obsidian-950 font-serif font-bold text-xl shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-white tracking-tight group-hover:text-gold-300 transition-colors">
              MEC AI MOSAIC
            </span>
            <span className="text-[10px] text-gold-400/80 tracking-widest uppercase font-mono">
              Bespoke Surface Studio
            </span>
          </div>
        </Link>

        {/* Public Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-gold-500/20 shadow-inner">
          <Link
            href="/studio"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/studio")
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 font-bold"
                : "text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Studio
          </Link>
          <Link
            href="/classic-collection"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/classic-collection")
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 font-bold"
                : "text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Classic Grid
          </Link>
          <Link
            href="/grand-medallions"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/grand-medallions")
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 font-bold"
                : "text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Hero Showcase
          </Link>
          <Link
            href="/bespoke-studio-experience"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/bespoke-studio-experience")
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 font-bold"
                : "text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Split Studio
          </Link>
        </nav>

        {/* Right Side Action Button for Public Visitors */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="px-5 py-2.5 rounded-xl text-xs font-serif font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20 scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" /> Open Studio
          </Link>
        </div>
      </div>
    </header>
  );
}
