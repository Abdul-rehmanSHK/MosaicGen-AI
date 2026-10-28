import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
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

  const brandName = appearance.footerBrandName || "Zakiah Marble";
  const description = appearance.footerDescription || "At Zakiah Marble, we specialize in creating bespoke, high-quality custom mosaic designs.";
  const phone = appearance.footerContactPhone || "+923129448844";

  return (
    <footer className="w-full bg-[#f4f3f2] border-t border-stone-200 py-12 text-stone-700 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
        {/* Brand & Contact Column (Left) */}
        <div className="flex flex-col gap-3.5 max-w-xl">
          <div className="flex items-center gap-3">
            {appearance.footerLogoUrl ? (
              <div className="relative w-9 h-9 rounded-lg bg-white border border-stone-200 overflow-hidden flex items-center justify-center shadow-sm">
                <Image
                  src={appearance.footerLogoUrl}
                  alt={brandName}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-stone-800 font-serif font-bold text-lg shadow-sm border border-stone-200">
                {brandName ? brandName[0].toUpperCase() : "Z"}
              </div>
            )}
            <span className="font-serif font-bold text-stone-900 text-xl tracking-tight">
              {brandName}
            </span>
          </div>

          {/* Guarantee of expert craftsmanship */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-700 shrink-0" />
            <span>Guarantee of expert craftsmanship for custom mosaic art by Zakiah Marble</span>
          </div>

          <p className="text-sm text-stone-600 font-normal leading-relaxed">
            {description}
          </p>

          {/* Contact & Location Details */}
          <div className="flex flex-col gap-2 text-xs text-stone-600 mt-1 font-mono">
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hover:text-stone-900 transition-colors font-semibold"
                >
                  Phone: {phone}
                </a>
              </div>
            )}
            {appearance.footerContactEmail && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <a
                  href={`mailto:${appearance.footerContactEmail}`}
                  className="hover:text-stone-900 transition-colors"
                >
                  {appearance.footerContactEmail}
                </a>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-3 text-stone-500 pt-0.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                2159 Voorhees Town Center, NJ, USA
              </span>
              <span className="hidden sm:inline text-stone-300">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                34 2C2 College Road, Township , Lahore
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-2 font-medium">
            {appearance.footerCopyright || "© 2026 Zakiah Marble. All Rights Reserved."}
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
