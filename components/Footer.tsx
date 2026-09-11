import React from "react";
import Link from "next/link";
import { Sparkles, Shield, MapPin, Database, LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function Footer() {
  let pages: Array<{ id: string; title: string; slug: string }> = [];
  try {
    pages = await prisma.page.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    });
  } catch (e) {
    // Fallback if db uninitialized
  }

  return (
    <footer className="w-full bg-obsidian-950 border-t border-gold-500/15 py-12 text-neutral-300 transition-colors relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Brand Column */}
        <div className="flex flex-col gap-3 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-obsidian-900 flex items-center justify-center text-gold-400 font-serif font-bold text-lg shadow-md border border-gold-500/20">
              M
            </div>
            <span className="font-serif font-bold text-white text-xl tracking-tight">MEC AI MOSAIC STUDIO</span>
          </div>
          <p className="text-sm text-neutral-400 max-w-md font-medium leading-relaxed">
            Pioneering luxury architectural surface design with AI-powered inpainting, custom waterjet mesh manufacturing, and Italian marble artistry.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono font-semibold mt-2">
            <Database className="w-3.5 h-3.5 text-neutral-600" /> Powered by Database CMS (HubDB & Prisma ORM)
          </div>
          <p className="text-xs text-neutral-500 mt-4 font-medium">
            © {new Date().getFullYear()} MEC Artworks Studio. All Rights Reserved.
          </p>
        </div>

        {/* Dynamic CMS Pages Column */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-gold-500/15 pb-2">
            Dynamic Pages
          </span>
          {pages.length > 0 ? (
            pages.map((pg) => (
              <Link
                key={pg.id}
                href={`/${pg.slug}`}
                className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                {pg.title}
              </Link>
            ))
          ) : (
            <>
              <Link href="/classic-collection" className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                Product Collections Catalog
              </Link>
              <Link href="/grand-medallions" className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                Grand Medallions Showcase
              </Link>
              <Link href="/bespoke-studio-experience" className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                Bespoke Experience & Specs
              </Link>
            </>
          )}
          <Link href="/studio" className="text-sm hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-1.5 mt-2 font-bold text-white">
            <Sparkles className="w-4 h-4 text-gold-400" /> Interactive Canvas Studio
          </Link>
        </div>

        {/* Admin Dashboard Column */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-gold-500/15 pb-2">
            Admin Portal
          </span>
          <Link href="/nextjs-app" className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5" /> Studio Admin
          </Link>
          <span className="text-sm font-medium text-neutral-400 flex items-center gap-2 mt-4">
            <MapPin className="w-4 h-4 text-neutral-500" /> Carrara, Italy & NY, USA
          </span>
        </div>
      </div>
    </footer>
  );
}
