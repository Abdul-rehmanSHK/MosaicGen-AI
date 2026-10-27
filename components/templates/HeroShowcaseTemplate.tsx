"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Layers, ArrowRight, CheckCircle, Send } from "lucide-react";
import { InquiryModal } from "@/components/InquiryModal";

interface Product {
  id: string;
  title: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  description: string;
}

interface PageData {
  id: string;
  title: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string | null;
  secondaryText?: string | null;
}

interface HeroShowcaseTemplateProps {
  page: PageData;
  products: Product[];
}

export function HeroShowcaseTemplate({ page, products }: HeroShowcaseTemplateProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f3f2] text-stone-900 flex flex-col gap-16 pb-24">
      {/* Editorial Parallax Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[550px] flex items-center justify-center overflow-hidden border-b border-stone-300/80">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              page.heroImageUrl ||
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"
            }
            alt={page.heading}
            fill
            priority
            className="object-cover brightness-[0.75] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f4f3f2] via-stone-950/60 to-stone-950/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md shadow-sm">
            <Layers className="w-3.5 h-3.5" /> High Impact Architectural Showcase
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white leading-tight drop-shadow-xl">
            {page.heading}
          </h1>

          <p className="text-base sm:text-xl text-stone-100 max-w-3xl leading-relaxed font-light drop-shadow-md">
            {page.bodyText}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              href="/"
              className="px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-stone-300" /> Open AI Mosaic Studio
            </Link>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-stone-900 font-serif font-semibold text-sm border border-stone-200 backdrop-blur-md flex items-center gap-2 transition-all shadow-md hover:scale-105 cursor-pointer"
            >
              <Send className="w-4 h-4 text-stone-700" /> Request Custom Quote
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Story & Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-stone-500 font-bold">
            Bespoke Craftsmanship Meets Neural AI
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
            Hand-Crafted Italian Tesserae Engineered for Modern Estates
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed font-light">
            {page.secondaryText ||
              "Every custom floor medallion and wall carpet is precision cut using Italian waterjet robotics and hand-assembled onto flexible mesh backings for effortless architectural installation."}
          </p>

          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-stone-800 flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">
                100% Genuine Italian Calacatta, Thassos & Spanish Nero Marquina
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-stone-800 flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">
                AI-Assisted live space masking & scale accurate mesh tiling previews
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-stone-800 flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">
                Pre-sealed waterproof mesh packaging ready for immediate job-site placement
              </span>
            </div>
          </div>
        </div>

        {/* Featured Visual Grid (6 cols) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((prod, idx) => (
            <Link
              key={prod.id}
              href={`/?product=${prod.id}`}
              className={`relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-md group bg-white ${
                idx === 0 ? "h-64 col-span-2" : "h-48"
              }`}
            >
              <Image
                src={prod.sampleImageUrl}
                alt={prod.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-mono text-stone-300 font-bold uppercase tracking-wider block">
                  {prod.category}
                </span>
                <h3 className="text-xs font-serif font-bold text-white line-clamp-1">{prod.title}</h3>
                {prod.description && (
                  <p className="text-[10px] text-stone-200 line-clamp-1 mt-0.5 font-light">
                    {prod.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
}
