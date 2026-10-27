import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { getSiteAppearance, MenuLinkItem, DEFAULT_FOOTER_LINKS } from "@/lib/appearance";

export async function Footer() {
  const appearance = await getSiteAppearance();

  let footerLinks: MenuLinkItem[] = DEFAULT_FOOTER_LINKS;
  try {
    footerLinks = JSON.parse(appearance.footerLinksJson || "[]");
    if (footerLinks.length === 0) footerLinks = DEFAULT_FOOTER_LINKS;
  } catch {
    footerLinks = DEFAULT_FOOTER_LINKS;
  }

  return (
    <footer className="w-full bg-[#f4f3f2] border-t border-stone-200 py-12 text-stone-700 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
        {/* Brand & Contact Column (Left) */}
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="flex items-center gap-3">
            {appearance.footerLogoUrl ? (
              <div className="relative w-9 h-9 rounded-lg bg-white border border-stone-200 overflow-hidden flex items-center justify-center shadow-sm">
                <Image
                  src={appearance.footerLogoUrl}
                  alt={appearance.footerBrandName}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-stone-800 font-serif font-bold text-lg shadow-sm border border-stone-200">
                {appearance.footerBrandName ? appearance.footerBrandName[0].toUpperCase() : "M"}
              </div>
            )}
            <span className="font-serif font-bold text-stone-900 text-xl tracking-tight">
              {appearance.footerBrandName || "MEC AI Studio"}
            </span>
          </div>

          <p className="text-sm text-stone-500 font-medium leading-relaxed">
            {appearance.footerDescription || "Luxury handcrafted mosaic surface and architectural design studio. Visualize bespoke Italian marble medallions, Byzantine gold glass, and artisanal tesserae live in your architectural spaces."}
          </p>

          {/* Contact & Location Details */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-500 mt-2 font-mono">
            {appearance.footerContactEmail && (
              <a
                href={`mailto:${appearance.footerContactEmail}`}
                className="hover:text-stone-900 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-stone-400" /> {appearance.footerContactEmail}
              </a>
            )}
            {appearance.footerContactPhone && (
              <a
                href={`tel:${appearance.footerContactPhone}`}
                className="hover:text-stone-900 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-stone-400" /> {appearance.footerContactPhone}
              </a>
            )}
            {appearance.footerAddress && (
              <span className="text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> {appearance.footerAddress}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-400 mt-3 font-medium">
            {appearance.footerCopyright || "© 2026 AI Mosaic Studio. All Rights Reserved."}
          </p>
        </div>

        {/* Studio Navigation (Right) */}
        <div className="flex flex-col gap-3 min-w-[220px]">
          <span className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-2">
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
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:translate-x-1 transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  {item.label} ↗
                </a>
              );
            }

            return (
              <Link
                key={idx}
                href={item.url}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:translate-x-1 transition-all flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
