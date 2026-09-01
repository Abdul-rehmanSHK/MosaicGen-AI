"use client";

import React, { useState } from "react";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { InquiryModal } from "@/components/InquiryModal";
import { Compass, Sparkles, Layers } from "lucide-react";

interface Product {
  id: string;
  title: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
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

interface SplitGalleryTemplateProps {
  page: PageData;
  products: Product[];
}

export function SplitGalleryTemplate({ page, products }: SplitGalleryTemplateProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState<any>(null);

  const handleOpenInquiry = (data?: any) => {
    setInquiryData(data);
    setIsInquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col gap-10 pb-24">
      {/* Top Banner */}
      <section className="w-full py-12 bg-luxury-gradient border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" /> Interactive Split Studio & Material Breakdown
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {page.heading}
          </h1>
          <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
            {page.bodyText}
          </p>
        </div>
      </section>

      {/* Main Split Design Studio Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <DesignStudio initialProducts={products} onOpenInquiryModal={handleOpenInquiry} />
      </section>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialData={inquiryData}
      />
    </div>
  );
}
