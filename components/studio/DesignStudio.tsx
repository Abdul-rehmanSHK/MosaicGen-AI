"use client";

import React, { useState, useRef, useEffect } from "react";
import { CanvasDraw, CanvasDrawRef } from "./CanvasDraw";
import { EmailOtpModal } from "./EmailOtpModal";
import { SpecialistModal } from "./SpecialistModal";
import { InquiryModal } from "@/components/InquiryModal";
import { Sparkles, Layers, Sliders, CheckCircle2, DollarSign, Grid, ArrowRight, Loader2, RefreshCw, Send, PhoneCall, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  specs: string;
}

interface GenerationResult {
  resultImageUrl: string;
  estimatedSqFt: number;
  estimatedTileCount: number;
  estimatedMaterialCost: number;
  promptApplied: string;
}

interface DesignStudioProps {
  initialProducts?: Product[];
  onOpenInquiryModal?: (generationData: { resultImageUrl: string; prompt: string; placement: string; estimatedCost: number }) => void;
}

const PLACEMENTS = [
  { id: "Auto-detect", label: "Auto-detect Space" },
  { id: "Floor Medallion", label: "Floor Medallion" },
  { id: "Backsplash", label: "Backsplash" },
  { id: "Accent Wall", label: "Accent Wall" },
  { id: "Pool", label: "Pool & Wellness" },
  { id: "Entryway", label: "Entryway & Rotunda" },
];

const FINISHES = ["Polished High-Gloss", "Satin Honed", "Antiqued Tumbled", "Textured Matte"];
const GROUT_COLORS = ["Champagne Gold", "Pure Thassos White", "Charcoal Slate", "Platinum Silver"];

export function DesignStudio({ initialProducts = [], onOpenInquiryModal }: DesignStudioProps) {
  const canvasRef = useRef<CanvasDrawRef>(null);

  const [placement, setPlacement] = useState<string>("Floor Medallion");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(
    "Celestial gold sunburst mosaic medallion with Nero Marquina border and fine Italian marble tesserae."
  );
  const [finish, setFinish] = useState<string>("Polished High-Gloss");
  const [groutColor, setGroutColor] = useState<string>("Champagne Gold");

  // OTP Verification State
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Modal State for Result Action Buttons
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
            if (data[0]) setSelectedProductId(data[0].id);
          }
        })
        .catch(() => {});
    } else if (products[0] && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      setError("Please describe your desired mosaic design prompt.");
      return;
    }

    if (!isOtpVerified) {
      // Intercept with 6-digit OTP verification modal before image generation phase
      setIsOtpModalOpen(true);
      return;
    }

    executeGeneration();
  };

  const executeGeneration = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const maskBase64 = canvasRef.current?.getMaskBase64();
      const inputImageBase64 = canvasRef.current?.getInputImageBase64();

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          placement,
          productId: selectedProductId,
          inputImageBase64,
          maskBase64,
          finish,
          groutColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation request failed");
      }

      setResult({
        resultImageUrl: data.resultImageUrl,
        estimatedSqFt: data.estimatedSqFt,
        estimatedTileCount: data.estimatedTileCount,
        estimatedMaterialCost: data.estimatedMaterialCost,
        promptApplied: data.promptApplied,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the design.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOtpVerified = (emailVerified: string) => {
    setIsOtpVerified(true);
    setVerifiedEmail(emailVerified);
    // Directly launch into the image generation phase
    executeGeneration();
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      {/* Studio Header Banner */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
          <Sparkles className="w-3.5 h-3.5" /> Bespoke AI Surface Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-white drop-shadow-md">
          AI Mosaic Surface & Floor Designer
        </h1>
        <p className="text-sm md:text-base text-neutral-400 max-w-2xl">
          Upload room photography or sketch mask boundaries on our interactive canvas to generate photorealistic luxury mosaic surfaces tailored for elite spaces.
        </p>

        {isOtpVerified && verifiedEmail && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Email: {verifiedEmail}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Canvas & Placement (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">1</span>
                Room Photo & Inpainting Mask
              </h2>
              <span className="text-xs text-neutral-400">Draw or upload space boundary</span>
            </div>

            <CanvasDraw ref={canvasRef} />
          </div>

          <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">2</span>
              Architectural Surface Placement
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {PLACEMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlacement(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    placement === item.id
                      ? "bg-gold-500 text-obsidian-950 font-bold border-gold-400 shadow-lg shadow-gold-500/20 scale-[1.02]"
                      : "bg-obsidian-800/80 text-neutral-300 border-neutral-800 hover:border-gold-500/40 hover:text-gold-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Style Reference, Prompt & AI Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">3</span>
              Texture & Style Reference Catalog
            </h2>
            <p className="text-xs text-neutral-400">Select material style anchor for AI rendering</p>

            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                    selectedProductId === prod.id
                      ? "bg-gold-500/10 border-gold-400 shadow-md shadow-gold-500/10"
                      : "bg-obsidian-950/60 border-neutral-800 hover:border-gold-500/30"
                  }`}
                >
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src={prod.sampleImageUrl}
                      alt={prod.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-gold-300">
                      {prod.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400">${prod.pricePerSqFt}/sq.ft • {prod.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">4</span>
              Mosaic Prompt & Finish Specs
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-300">Design Vision & Prompt</label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Celestial rotunda mosaic medallion with gold leaf tesserae and royal blue lapis lazuli accents..."
                className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-neutral-400">Surface Finish</label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full p-2 rounded-lg bg-obsidian-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-gold-400"
                >
                  {FINISHES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-neutral-400">Grout Accent</label>
                <select
                  value={groutColor}
                  onChange={(e) => setGroutColor(e.target.value)}
                  className="w-full p-2 rounded-lg bg-obsidian-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-gold-400"
                >
                  {GROUT_COLORS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                  Rendering Mosaic Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-obsidian-950 fill-obsidian-950" />
                  Generate AI Mosaic Surface
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Generated Result & Material Breakdown Section */}
      {result && (
        <div className="p-8 rounded-3xl bg-obsidian-900/90 border border-gold-500/40 shadow-2xl backdrop-blur-2xl flex flex-col gap-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gold-500/10 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> High Precision Surface Render Complete
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Generated Architectural Surface</h2>
            </div>

            {/* TWO FRONTEND ACTION BUTTONS: Quote Request & Talk to Specialist */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
              >
                <Send className="w-4 h-4" /> Request Quote & Sample Box
              </button>

              <button
                type="button"
                onClick={() => setIsSpecialistModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-gold-500/40 text-gold-300 font-serif font-bold text-xs flex items-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-gold-400" /> Talk to Specialist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative w-full h-[450px] rounded-2xl overflow-hidden border border-gold-500/30 shadow-2xl bg-obsidian-950 group">
              <Image
                src={result.resultImageUrl}
                alt="AI Generated Mosaic Surface"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-obsidian-950/80 backdrop-blur-md border border-gold-500/20">
                <p className="text-xs text-neutral-300 font-mono line-clamp-2">
                  <span className="text-gold-400 font-bold">Prompt:</span> {result.promptApplied}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 bg-obsidian-950/80 p-6 rounded-2xl border border-neutral-800">
              <h3 className="text-lg font-serif font-semibold text-gold-300 border-b border-neutral-800 pb-3 flex items-center gap-2">
                <Grid className="w-4 h-4 text-gold-400" /> Architectural Material Estimation
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-obsidian-900 border border-neutral-800">
                  <span className="text-xs text-neutral-400 block mb-1">Estimated Area</span>
                  <span className="text-xl font-bold font-serif text-white">{result.estimatedSqFt} sq.ft</span>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-neutral-800">
                  <span className="text-xs text-neutral-400 block mb-1">Mosaic Chips</span>
                  <span className="text-xl font-bold font-serif text-white">{result.estimatedTileCount.toLocaleString()}</span>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/30 col-span-2">
                  <span className="text-xs text-gold-400 font-medium block mb-1">Estimated Material Cost</span>
                  <span className="text-3xl font-serif font-bold text-white">${result.estimatedMaterialCost.toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-400 block mt-1">*Includes custom waterjet mesh mounting & sealed crates.</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Selected Style:</span>
                  <span className="font-semibold text-white">{selectedProduct?.title || "Bespoke Italian"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Surface Placement:</span>
                  <span className="font-semibold text-white">{placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Finish / Grout:</span>
                  <span className="font-semibold text-white">{finish} • {groutColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Email Verification Modal */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerified={handleOtpVerified}
      />

      {/* Quote & Sample Inquiry Modal */}
      <InquiryModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialData={result ? { resultImageUrl: result.resultImageUrl, prompt, placement, estimatedCost: result.estimatedMaterialCost } : undefined}
      />

      {/* Specialist Consultation Modal */}
      <SpecialistModal
        isOpen={isSpecialistModalOpen}
        onClose={() => setIsSpecialistModalOpen(false)}
        initialData={result ? { resultImageUrl: result.resultImageUrl, prompt, placement } : undefined}
      />
    </div>
  );
}
