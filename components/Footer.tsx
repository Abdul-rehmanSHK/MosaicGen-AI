import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Database, Mail, Phone, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteAppearance, MenuLinkItem, DEFAULT_FOOTER_LINKS } from "@/lib/appearance";

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

  const appearance = await getSiteAppearance();

  let footerLinks: MenuLinkItem[] = DEFAULT_FOOTER_LINKS;
  try {
    footerLinks = JSON.parse(appearance.footerLinksJson || "[]");
    if (footerLinks.length === 0) footerLinks = DEFAULT_FOOTER_LINKS;
  } catch {
    footerLinks = DEFAULT_FOOTER_LINKS;
  }

  return (
    <footer className="w-full bg-obsidian-950 border-t border-gold-500/15 py-12 text-neutral-300 transition-colors relative overflow-hidden">
      {/* Decorative Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Brand & Editorial Description Column */}
        <div className="flex flex-col gap-3 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            {appearance.footerLogoUrl ? (
              <div className="relative w-9 h-9 rounded-lg bg-obsidian-900 border border-gold-500/20 overflow-hidden flex items-center justify-center shadow-md">
                <Image
                  src={appearance.footerLogoUrl}
                  alt={appearance.footerBrandName}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-obsidian-900 flex items-center justify-center text-gold-400 font-serif font-bold text-lg shadow-md border border-gold-500/20">
                {appearance.footerBrandName ? appearance.footerBrandName[0].toUpperCase() : "M"}
              </div>
            )}
            <span className="font-serif font-bold text-white text-xl tracking-tight">
              {appearance.footerBrandName}
            </span>
          </div>

          <p className="text-sm text-neutral-400 max-w-md font-medium leading-relaxed">
            {appearance.footerDescription}
          </p>

          {/* Contact Details */}
          <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mt-2 font-mono">
            {appearance.footerContactEmail && (
              <a
                href={`mailto:${appearance.footerContactEmail}`}
                className="hover:text-gold-300 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gold-400" /> {appearance.footerContactEmail}
              </a>
            )}
            {appearance.footerContactPhone && (
              <a
                href={`tel:${appearance.footerContactPhone}`}
                className="hover:text-gold-300 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gold-400" /> {appearance.footerContactPhone}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono font-semibold mt-1">
            <Database className="w-3.5 h-3.5 text-neutral-600" /> Powered by Database CMS (HubDB & Prisma ORM)
          </div>

          <p className="text-xs text-neutral-500 mt-3 font-medium">
            {appearance.footerCopyright}
          </p>
        </div>

        {/* Studio Navigation (Dynamic from CMS) */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-gold-500/15 pb-2">
            Navigation
          </span>
          {footerLinks.map((item, idx) => {
            if (item.external) {
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                  {item.label} ↗
                </a>
              );
            }

            return (
              <Link
                key={idx}
                href={item.url}
                className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Dynamic CMS Pages & Locations Column */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-gold-500/15 pb-2">
            Featured Collections
          </span>
          {pages.length > 0 ? (
            pages.slice(0, 4).map((pg) => (
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
              <Link
                href="/classic-collection"
                className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                Product Collections Catalog
              </Link>
              <Link
                href="/grand-medallions"
                className="text-sm font-medium text-neutral-400 hover:text-gold-300 hover:translate-x-1 transition-all flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
                Grand Medallions Showcase
              </Link>
            </>
          )}

          {appearance.footerAddress && (
            <span className="text-sm font-medium text-neutral-400 flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800/60 font-mono text-xs">
              <MapPin className="w-4 h-4 text-gold-400/70 shrink-0" /> {appearance.footerAddress}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
