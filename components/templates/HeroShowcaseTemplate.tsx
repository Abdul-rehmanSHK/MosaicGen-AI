"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Layers, ArrowRight, CheckCircle, Send, Compass } from "lucide-react";
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
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col gap-16 pb-24">
      {/* Editorial Parallax Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[550px] flex items-center justify-center overflow-hidden border-b border-gold-500/20">
        <div className="absolute inset-0 z-0">
          <Image
            src={page.heroImageUrl || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"}
            alt={page.heading}
            fill
            priority
            className="object-cover brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-obsidian-950/30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian-950/80 border border-gold-500/40 text-gold-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Layers className="w-3.5 h-3.5" /> High Impact Architectural Showcase
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
            {page.heading}
          </h1>

          <p className="text-base sm:text-xl text-neutral-200 max-w-3xl leading-relaxed font-light drop-shadow-md">
            {page.bodyText}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-gold-500/25 scale-105"
            >
              <Sparkles className="w-4 h-4 fill-obsidian-950" /> Open AI Mosaic Studio
            </Link>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="px-8 py-4 rounded-2xl bg-obsidian-900/90 hover:bg-obsidian-800 text-white font-serif font-semibold text-sm border border-gold-500/30 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4 text-gold-400" /> Request Custom Quote
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Story & Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold">
            Bespoke Craftsmanship Meets Neural AI
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Hand-Crafted Italian Tesserae Engineered for Modern Estates
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {page.secondaryText || "Every custom floor medallion and wall carpet is precision cut using Italian waterjet robotics and hand-assembled onto flexible mesh backings for effortless architectural installation."}
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <span className="text-xs text-neutral-200">100% Genuine Italian Calacatta, Thassos & Spanish Nero Marquina</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <span className="text-xs text-neutral-200">AI-Assisted live space masking & scale accurate mesh tiling previews</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <span className="text-xs text-neutral-200">Pre-sealed waterproof mesh packaging ready for immediate job-site placement</span>
            </div>
          </div>
        </div>

        {/* Featured Visual Grid (6 cols) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((prod, idx) => (
            <div
              key={prod.id}
              className={`relative rounded-2xl overflow-hidden border border-gold-500/30 shadow-xl group ${
                idx === 0 ? "h-64 col-span-2" : "h-48"
              }`}
            >
              <Image
                src={prod.sampleImageUrl}
                alt={prod.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] font-mono text-gold-400 font-bold block">{prod.category}</span>
                <h3 className="text-xs font-serif font-bold text-white line-clamp-1">{prod.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
}
