import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Sparkles, Layers, Grid, Compass, ArrowRight, ShieldCheck, Award, Gem } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full py-28 md:py-36 bg-luxury-gradient overflow-hidden border-b border-gold-500/20">
        {/* Ambient Backlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none animate-pulseGlow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-xl shadow-gold-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-gold-400 animate-spin-slow" />
            <span>Next-Generation Architectural Surfaces</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl">
            AI Mosaic Surface & <span className="gold-text-gradient">Floor Design Studio</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl leading-relaxed font-light">
            Empowering master architects and interior designers to render bespoke Italian marble medallions, Byzantine gold glass tesserae, and waterjet floor carpets live onto room photography using high-precision neural inpainting.
          </p>

          {/* Key Feature Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-neutral-300 my-2">
            <span className="flex items-center gap-1.5 bg-obsidian-900/60 px-3.5 py-1.5 rounded-full border border-gold-500/15">
              <Gem className="w-3.5 h-3.5 text-gold-400" /> Carrara Marble & Venetian Glass
            </span>
            <span className="flex items-center gap-1.5 bg-obsidian-900/60 px-3.5 py-1.5 rounded-full border border-gold-500/15">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> Architectural Precision Inpainting
            </span>
            <span className="flex items-center gap-1.5 bg-obsidian-900/60 px-3.5 py-1.5 rounded-full border border-gold-500/15">
              <Award className="w-3.5 h-3.5 text-gold-400" /> Instant Project Estimation
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 font-serif font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-gold-500/25 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-obsidian-950" /> Launch AI Studio
            </Link>
            <Link
              href="/classic-collection"
              className="px-8 py-4 rounded-2xl bg-obsidian-900/80 hover:bg-obsidian-800 text-white font-serif font-semibold text-sm border border-gold-500/30 hover:border-gold-400/60 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Grid className="w-4 h-4 text-gold-400" /> Explore Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Templates Showcase Bar */}
      <section className="w-full bg-obsidian-900/90 border-b border-gold-500/15 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold block mb-1">
                CMS Layout Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                3 Fixed Architectural Templates
              </h2>
            </div>
            <span className="text-xs text-neutral-400 bg-obsidian-950 px-3.5 py-2 rounded-xl border border-gold-500/15">
              Rendered dynamically from database CMS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/classic-collection"
              className="group glass-card p-7 rounded-2xl flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 w-fit group-hover:bg-gold-500 group-hover:text-obsidian-950 transition-colors">
                  <Grid className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                  1. Product Collections
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Clean luxury catalog grid with category filters, detailed specs modal, and lead quote drawers.
                </p>
              </div>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1.5 pt-2 border-t border-neutral-800/50">
                Explore Collections <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Link>

            <Link
              href="/grand-medallions"
              className="group glass-card p-7 rounded-2xl flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 w-fit group-hover:bg-gold-500 group-hover:text-obsidian-950 transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                  2. Grand Medallions
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  High-impact full-width banner with editorial storytelling, imagery showcases, and instant CTAs.
                </p>
              </div>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1.5 pt-2 border-t border-neutral-800/50">
                Explore Medallions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Link>

            <Link
              href="/bespoke-studio-experience"
              className="group glass-card p-7 rounded-2xl flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 w-fit group-hover:bg-gold-500 group-hover:text-obsidian-950 transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                  3. Bespoke Experience
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Side-by-side interactive canvas studio and live material breakdown for instant project estimation.
                </p>
              </div>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1.5 pt-2 border-t border-neutral-800/50">
                Explore Bespoke Studio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Embedded Studio Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <DesignStudio initialProducts={products} />
      </section>

      <Footer />
    </main>
  );
}
