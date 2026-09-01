import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Sparkles, Layers, Grid, Compass, ArrowRight, CheckCircle2, ShieldCheck, Star } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const pages = await prisma.page.findMany();

  return (
    <main className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 bg-luxury-gradient overflow-hidden border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Architectural Surfaces
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight text-white leading-tight max-w-4xl">
            AI Mosaic Surface & Floor Design Studio
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-3xl leading-relaxed font-light">
            Empowering master architects and interior designers to render bespoke Italian marble medallions, gold glass tesserae, and waterjet floor carpets live onto room photography using high-precision neural inpainting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-gold-500/25 scale-105"
            >
              <Sparkles className="w-4 h-4 fill-obsidian-950" /> Launch AI Studio
            </Link>
            <Link
              href="/classic-collection"
              className="px-8 py-4 rounded-2xl bg-obsidian-900 hover:bg-obsidian-800 text-white font-serif font-semibold text-sm border border-gold-500/30 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Grid className="w-4 h-4 text-gold-400" /> Explore Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Templates Showcase Bar */}
      <section className="w-full bg-obsidian-900 border-b border-gold-500/15 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold block mb-1">
                CMS Layout Engine
              </span>
              <h2 className="text-2xl font-serif font-bold text-white">3 Fixed Architectural Templates</h2>
            </div>
            <span className="text-xs text-neutral-400 hidden sm:inline">Rendered dynamically from PostgreSQL database</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/classic-collection"
              className="group p-6 rounded-2xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col gap-3"
            >
              <div className="p-3 rounded-xl bg-gold-500/10 text-gold-400 w-fit">
                <Grid className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                1. Classic Grid Template
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Clean luxury catalog grid with category filters, detailed specs modal, and lead quote drawers.
              </p>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1 mt-2">
                Preview Classic Grid <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/grand-medallions"
              className="group p-6 rounded-2xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col gap-3"
            >
              <div className="p-3 rounded-xl bg-gold-500/10 text-gold-400 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                2. Hero Showcase Template
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                High-impact full-width banner with editorial storytelling, imagery showcases, and instant CTAs.
              </p>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1 mt-2">
                Preview Hero Showcase <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/bespoke-studio-experience"
              className="group p-6 rounded-2xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 transition-all flex flex-col gap-3"
            >
              <div className="p-3 rounded-xl bg-gold-500/10 text-gold-400 w-fit">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                3. Split Gallery Template
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Side-by-side interactive canvas studio and live material breakdown for instant project estimation.
              </p>
              <span className="text-xs font-semibold text-gold-400 flex items-center gap-1 mt-2">
                Preview Split Studio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
