import React from "react";
import Link from "next/link";
import { Sparkles, Shield, MapPin, Database } from "lucide-react";
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
    <footer className="w-full bg-obsidian-950 border-t border-gold-500/15 py-12 text-neutral-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="flex flex-col gap-3 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-obsidian-950 font-serif font-bold text-lg">
              M
            </div>
            <span className="font-serif font-bold text-white text-lg">MEC AI MOSAIC STUDIO</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-md">
            Pioneering luxury architectural surface design with AI-powered inpainting, custom waterjet mesh manufacturing, and Italian marble artistry.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gold-400 font-mono">
            <Database className="w-3 h-3 text-gold-400" /> Powered by Database CMS (HubDB & Prisma ORM)
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            © {new Date().getFullYear()} MEC Artworks Studio. All Rights Reserved.
          </p>
        </div>

        {/* Dynamic CMS Pages Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-serif font-semibold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
            Dynamic Pages
          </span>
          {pages.length > 0 ? (
            pages.map((pg) => (
              <Link
                key={pg.id}
                href={`/${pg.slug}`}
                className="text-xs text-neutral-300 hover:text-gold-300 transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                {pg.title}
              </Link>
            ))
          ) : (
            <>
              <Link href="/classic-collection" className="text-xs hover:text-gold-300 transition-colors">
                Product Collections Catalog
              </Link>
              <Link href="/grand-medallions" className="text-xs hover:text-gold-300 transition-colors">
                Grand Medallions Showcase
              </Link>
              <Link href="/bespoke-studio-experience" className="text-xs hover:text-gold-300 transition-colors">
                Bespoke Experience & Specs
              </Link>
            </>
          )}
          <Link href="/studio" className="text-xs hover:text-gold-300 transition-colors flex items-center gap-1 mt-1 font-semibold text-gold-300">
            <Sparkles className="w-3 h-3 text-gold-400" /> Interactive Canvas Studio
          </Link>
        </div>

        {/* NextJS App Admin Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-serif font-semibold text-gold-400 uppercase tracking-widest">
            NextJS App Admin
          </span>
          <Link href="/nextjs-app/login" className="text-xs hover:text-gold-300 transition-colors flex items-center gap-1">
            <Shield className="w-3 h-3 text-gold-400" /> NextJS App Admin Portal
          </Link>
          <span className="text-xs text-neutral-500 flex items-center gap-1.5 mt-4">
            <MapPin className="w-3 h-3 text-gold-400" /> Carrara, Italy & NY, USA
          </span>
        </div>
      </div>
    </footer>
  );
}
