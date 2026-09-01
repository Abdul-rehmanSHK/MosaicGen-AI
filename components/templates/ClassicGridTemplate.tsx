"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid, Sparkles, Filter, Info, Send, ArrowRight } from "lucide-react";
import { InquiryModal } from "@/components/InquiryModal";

interface Product {
  id: string;
  title: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  description: string;
  specs: string;
}

interface PageData {
  id: string;
  title: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string | null;
  secondaryText?: string | null;
}

interface ClassicGridTemplateProps {
  page: PageData;
  products: Product[];
}

export function ClassicGridTemplate({ page, products }: ClassicGridTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [inquiryProductId, setInquiryProductId] = useState<string | undefined>(undefined);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleOpenInquiry = (productId?: string) => {
    setInquiryProductId(productId);
    setIsInquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col gap-12 pb-24">
      {/* Header Banner */}
      <section className="relative w-full py-20 bg-luxury-gradient border-b border-gold-500/20 overflow-hidden">
        {page.heroImageUrl && (
          <div className="absolute inset-0 z-0 opacity-25">
            <Image src={page.heroImageUrl} alt={page.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest">
            <Grid className="w-3.5 h-3.5" /> Classic Architectural Grid
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight drop-shadow-md">
            {page.heading}
          </h1>
          <p className="text-sm md:text-base text-neutral-300 max-w-3xl leading-relaxed">
            {page.bodyText}
          </p>
          {page.secondaryText && (
            <p className="text-xs text-gold-400 font-mono italic max-w-2xl">
              {page.secondaryText}
            </p>
          )}
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-gold-400 mr-2" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                    : "bg-obsidian-800 text-neutral-300 hover:bg-obsidian-700 hover:text-gold-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Link
            href="/studio"
            className="px-5 py-2.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-serif font-bold flex items-center gap-2 transition-all ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Customize in AI Studio
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => {
            let parsedSpecs: Record<string, string> = {};
            try {
              parsedSpecs = JSON.parse(prod.specs);
            } catch (e) {}

            return (
              <div
                key={prod.id}
                className="group relative rounded-3xl bg-obsidian-900/90 border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-64 overflow-hidden bg-obsidian-950">
                    <Image
                      src={prod.sampleImageUrl}
                      alt={prod.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-xs font-serif font-bold">
                      ${prod.pricePerSqFt}/sq.ft
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                      {prod.category}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold-300 transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {parsedSpecs.material && (
                      <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-300 flex flex-wrap gap-y-1 justify-between">
                        <span><strong className="text-neutral-500">Material:</strong> {parsedSpecs.material}</span>
                        <span><strong className="text-neutral-500">Finish:</strong> {parsedSpecs.finish}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalProduct(prod)}
                    className="flex-1 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Info className="w-3.5 h-3.5 text-gold-400" /> Inspect Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenInquiry(prod.id)}
                    className="py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-gold-500/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Specs Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white font-mono text-sm"
            >
              ✕
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-neutral-800">
                <Image
                  src={activeModalProduct.sampleImageUrl}
                  alt={activeModalProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gold-400 font-mono uppercase font-bold">
                  {activeModalProduct.category}
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">{activeModalProduct.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{activeModalProduct.description}</p>
                <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs flex justify-between">
                  <span className="text-neutral-400">Price:</span>
                  <span className="font-serif font-bold text-gold-300">${activeModalProduct.pricePerSqFt} / sq.ft</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const pId = activeModalProduct.id;
                setActiveModalProduct(null);
                handleOpenInquiry(pId);
              }}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Order Sample Box & Architect Quote
            </button>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialData={{ productId: inquiryProductId }}
      />
    </div>
  );
}
