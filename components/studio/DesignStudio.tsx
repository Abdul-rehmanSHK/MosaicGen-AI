"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CanvasDraw, CanvasDrawRef, PRESET_ROOMS } from "./CanvasDraw";
import { EmailOtpModal } from "./EmailOtpModal";
import { InpaintingMaskModal } from "./InpaintingMaskModal";
import { SpecialistModal } from "./SpecialistModal";
import { InquiryModal } from "@/components/InquiryModal";
import { InspirationGallery } from "./InspirationGallery";
import { MosaicFinderBanner } from "./MosaicFinderBanner";
import { GenerationWorkingScreen } from "./GenerationWorkingScreen";
import { UserAccountMenu } from "./UserAccountMenu";
import { MyGenerationsModal } from "./MyGenerationsModal";
import { Sparkles, Layers, Sliders, CheckCircle2, DollarSign, Grid, ArrowRight, Loader2, RefreshCw, Send, PhoneCall, ShieldCheck } from "lucide-react";
import Image from "next/image";

const SCRATCH_INSPIRATIONS = [
  { label: "Onyx & Gold Leaf", prompt: "A dramatic luxury architectural mosaic with polished black onyx, luminous 24k gold leaf tesserae, and subtle brass accents." },
  { label: "Iridescent Sea Glass", prompt: "An iridescent sea glass mosaic in aqua, turquoise, and seafoam tones with smooth tumbled edges and subtle pearl highlights." },
  { label: "Moroccan Zellige", prompt: "Handmade Moroccan zellige geometric tile mosaic with intricate star patterns, rich terracotta undertones, and glazed ivory tiles." },
  { label: "Art Deco Geometry", prompt: "An elegant Art Deco geometric mosaic pattern with emerald green marble, polished brass inlays, and Thassos white marble borders." },
  { label: "Roman Rotunda", prompt: "A classical Roman mosaic medallion featuring a central sunburst motif, laurel wreath border, and antiqued Italian marble tesserae." }
];

interface Product {
  id: string;
  title: string;
  description?: string;
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
  startFromScratch?: boolean;
  initialSelectedProductId?: string;
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

export function DesignStudio({ initialProducts = [], startFromScratch = false, initialSelectedProductId, onOpenInquiryModal }: DesignStudioProps) {
  const canvasRef = useRef<CanvasDrawRef>(null);
  const searchParams = useSearchParams();
  const isScratch = startFromScratch || searchParams?.get("mode") === "scratch";

  const [placement, setPlacement] = useState<string>("Floor Medallion");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(
    "Warm earth tones with a Moroccan zellige-inspired pattern in terracotta and indigo"
  );
  const [finish, setFinish] = useState<string>("Polished High-Gloss");
  const [groutColor, setGroutColor] = useState<string>("Champagne Gold");

  // OTP Verification State & Free Previews Quota
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [generationsTrigger, setGenerationsTrigger] = useState(0);
  const [isMyGenerationsOpen, setIsMyGenerationsOpen] = useState(false);

  // Modal State for Result Action Buttons
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);

  // Room Photo & Inpainting Mask Modal State
  const [isMaskModalOpen, setIsMaskModalOpen] = useState(false);
  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>("/images/preset-grand-bedroom.jpg");
  const [roomPhotoName, setRoomPhotoName] = useState<string | null>("Mosaic-Wall-Art-Tropical-theme-1024x737.jpeg");
  const [hasDrawnMask, setHasDrawnMask] = useState(false);

  const handleSelectPresetRoom = (preset: { name: string; url: string }) => {
    setRoomPhotoUrl(preset.url);
    setRoomPhotoName(preset.name);
    canvasRef.current?.loadPresetImage(preset.url);
  };

  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRoomPhotoUrl(dataUrl);
      setRoomPhotoName(file.name);
      canvasRef.current?.loadCustomImage?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearRoomPhoto = () => {
    setRoomPhotoUrl(null);
    setRoomPhotoName(null);
    setHasDrawnMask(false);
    canvasRef.current?.clearCanvas();
  };

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync prompt, placement, and verified status from URL search parameters (e.g., from Finder wizard)
  useEffect(() => {
    const urlPrompt = searchParams?.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
    const urlPlacement = searchParams?.get("placement");
    if (urlPlacement) {
      const match = PLACEMENTS.find(
        (p) =>
          p.id.toLowerCase() === urlPlacement.toLowerCase() ||
          p.label.toLowerCase().includes(urlPlacement.toLowerCase())
      );
      if (match) {
        setPlacement(match.id);
      } else {
        setPlacement(urlPlacement);
      }
    }
    if (searchParams?.get("verified") === "true") {
      setIsOtpVerified(true);
      const urlEmail = searchParams.get("email");
      if (urlEmail) {
        setVerifiedEmail(urlEmail);
        if (typeof window !== "undefined") {
          localStorage.setItem("mec_verified_email", urlEmail);
          window.dispatchEvent(new Event("mec_verified_email_updated"));
        }
      }
    }
  }, [searchParams]);

  // Sync verified email from localStorage on initial load & updates
  useEffect(() => {
    const syncEmail = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("mec_verified_email") : null;
      if (stored) {
        setIsOtpVerified(true);
        setVerifiedEmail(stored);
      }
    };
    syncEmail();
    window.addEventListener("mec_verified_email_updated", syncEmail);
    return () => window.removeEventListener("mec_verified_email_updated", syncEmail);
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
            if (initialSelectedProductId && data.some(p => p.id === initialSelectedProductId)) {
              setSelectedProductId(initialSelectedProductId);
              const selected = data.find(p => p.id === initialSelectedProductId);
              setPrompt(`A beautiful variation inspired by ${selected.title}, custom mosaic art...`);
            } else if (data[0]) {
              setSelectedProductId(data[0].id);
            }
          }
        })
        .catch(() => {});
    } else {
      if (initialSelectedProductId && products.some(p => p.id === initialSelectedProductId)) {
        setSelectedProductId(initialSelectedProductId);
        const selected = products.find(p => p.id === initialSelectedProductId);
        if (selected) setPrompt(`A beautiful variation inspired by ${selected.title}, custom mosaic art...`);
      } else if (products[0] && !selectedProductId) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [products, initialSelectedProductId]);

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
    setResult(null);
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 80, behavior: "smooth" });
    }

    try {
      // Only extract mask if not scratch mode AND user actually drew an inpainting mask
      const maskBase64 = (!isScratch && hasDrawnMask && canvasRef.current?.getMaskBase64)
        ? canvasRef.current.getMaskBase64()
        : null;

      // Prefer the direct high-res uploaded photo dataUrl, fallback to canvas snapshot if available
      let inputImageBase64: string | null = null;
      if (!isScratch) {
        if (roomPhotoUrl && roomPhotoUrl.startsWith("data:image")) {
          inputImageBase64 = roomPhotoUrl;
        } else if (canvasRef.current?.getInputImageBase64) {
          inputImageBase64 = canvasRef.current.getInputImageBase64();
        }
      }

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
          email: verifiedEmail || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Generation request failed");
      }

      setResult({
        resultImageUrl: data.resultImageUrl,
        estimatedSqFt: data.estimatedSqFt,
        estimatedTileCount: data.estimatedTileCount,
        estimatedMaterialCost: data.estimatedMaterialCost,
        promptApplied: data.promptApplied,
      });
      setGenerationsTrigger((prev) => prev + 1);
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
    if (typeof window !== "undefined") {
      localStorage.setItem("mec_verified_email", emailVerified);
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
    // Directly launch into the image generation phase
    executeGeneration();
  };

  const handleUseDifferentEmail = () => {
    setIsOtpVerified(false);
    setVerifiedEmail("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("mec_verified_email");
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
  };

  const handleSelectGeneration = (gen: any) => {
    setPrompt(gen.prompt);
    if (gen.placement) setPlacement(gen.placement);
    setResult({
      resultImageUrl: gen.resultImageUrl,
      estimatedSqFt: 64,
      estimatedTileCount: 9216,
      estimatedMaterialCost: 5440,
      promptApplied: gen.prompt,
    });
    setTimeout(() => {
      const el = document.getElementById("ai-mosaic-result");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      {isGenerating ? (
        <GenerationWorkingScreen
          prompt={prompt}
          placement={placement}
          roomPhotoUrl={roomPhotoUrl}
          roomPhotoName={roomPhotoName}
          finish={finish}
          groutColor={groutColor}
          onCancel={() => setIsGenerating(false)}
        />
      ) : (
        <>
          {isScratch ? (
        /* ==================== IMAGINE FROM SCRATCH MODE ==================== */
        <div className="w-full flex flex-col gap-8">
          {/* Scratch Studio Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
              <Sparkles className="w-3.5 h-3.5" /> Imagine from scratch
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
              AI Mosaic Studio
            </h1>
            <p className="text-sm md:text-base text-neutral-400 max-w-xl">
              Describe a vision — we&apos;ll render a one-of-a-kind mosaic concept.
            </p>

            {isOtpVerified && verifiedEmail && (
              <div className="flex items-center gap-3 mt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified: {verifiedEmail}
                </div>
                <UserAccountMenu
                  email={verifiedEmail}
                  onUseDifferentEmail={handleUseDifferentEmail}
                  onSelectGeneration={handleSelectGeneration}
                  refreshTrigger={generationsTrigger}
                />
              </div>
            )}
          </div>

          {/* Unified Luxury Prompt Card (No photo upload / No canvas) */}
          <div className="w-full rounded-2xl border border-gold-500/30 bg-obsidian-900/90 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col transition-all">
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Describe your mosaic concept</span>
                  <span className="text-gold-400/80 lowercase text-[11px] font-sans">pure AI generation from vision</span>
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A Mediterranean kitchen backsplash in hand-cut gold and ivory glass with subtle copper veins..."
                  className="w-full p-4 rounded-xl bg-obsidian-950/80 border border-neutral-800 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none leading-relaxed font-light"
                  autoFocus
                />
              </div>

              {/* Surface Placement & Finishing Specs (2-column layout to cover empty space) */}
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Where should it go? (col-span-7) */}
                  <div className="lg:col-span-7 flex flex-col gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Where should it go?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PLACEMENTS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPlacement(item.id)}
                          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium transition-all border ${
                            placement === item.id
                              ? "bg-gold-500 text-obsidian-950 font-bold border-gold-400 shadow-md shadow-gold-500/20 scale-[1.02]"
                              : "bg-obsidian-950 text-neutral-300 border-neutral-800 hover:border-gold-500/40 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: The 2 Select Fields Covering Up the Empty Space (col-span-5) */}
                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-neutral-400">Surface Finish</label>
                      <select
                        value={finish}
                        onChange={(e) => setFinish(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-gold-400"
                      >
                        {FINISHES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-neutral-400">Grout Accent</label>
                      <select
                        value={groutColor}
                        onChange={(e) => setGroutColor(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-gold-400"
                      >
                        {GROUT_COLORS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex flex-col gap-2.5">
                  <span>{error}</span>
                  {error.toLowerCase().includes("limit") && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsMyGenerationsOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs cursor-pointer shadow-md"
                      >
                        View My Generations
                      </button>
                      <button
                        type="button"
                        onClick={handleUseDifferentEmail}
                        className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs cursor-pointer"
                      >
                        Use a Different Email
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                      Rendering Mosaic Concept...
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

            {/* Quick Inspiration Pills Strip */}
            <div className="bg-obsidian-950 px-6 py-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-400 flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> Try some inspiration:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SCRATCH_INSPIRATIONS.map((insp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(insp.prompt)}
                    className="px-3.5 py-1.5 rounded-full text-xs bg-obsidian-900 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-300 border border-neutral-800 hover:border-gold-500/40 transition-all font-medium"
                  >
                    {insp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== CUSTOMIZE YOUR SPACE MODE ==================== */
        <div className="w-full flex flex-col gap-6">
          {/* Studio Header Banner */}
          <div className="text-center flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
              <Sparkles className="w-3.5 h-3.5" /> Bespoke AI Surface Studio
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-white drop-shadow-md">
              AI Mosaic Surface & Floor Designer
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 max-w-2xl">
              Upload room photography and target your space boundary to generate photorealistic luxury mosaic surfaces tailored for elite spaces.
            </p>

            {isOtpVerified && verifiedEmail && (
              <div className="flex items-center gap-3 mt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified: {verifiedEmail}
                </div>
                <UserAccountMenu
                  email={verifiedEmail}
                  onUseDifferentEmail={handleUseDifferentEmail}
                  onSelectGeneration={handleSelectGeneration}
                  refreshTrigger={generationsTrigger}
                />
              </div>
            )}
          </div>

          {/* Upper Section: Compact Room Photo Upload & Inpainting Target Button */}
          <div className="w-full p-4 sm:p-5 rounded-2xl bg-obsidian-900/90 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">1</span>
                Room Photo & Inpainting Mask
              </h2>
              <span className="text-xs text-neutral-400">Target exact surface area with mask</span>
            </div>

            {roomPhotoUrl ? (
              /* Image is Loaded -> Show Compact Thumbnail Preview + Target Inpainting Mask Button */
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-obsidian-950/80 border border-gold-500/30">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-20 h-16 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-gold-500/40 shrink-0 bg-obsidian-900">
                    <img
                      src={roomPhotoUrl}
                      alt="Room Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white line-clamp-1">
                      {roomPhotoName || "Custom Room Space"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        hasDrawnMask
                          ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {hasDrawnMask ? "✓ Inpainting Mask Active" : "Full Space Selected"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsMaskModalOpen(true)}
                    className="py-2.5 px-4 rounded-xl font-serif font-bold text-xs bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 flex items-center gap-2 shadow-md shadow-gold-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-obsidian-950" />
                    Target Inpainting Mask on Photo
                  </button>
                  <label className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition-all">
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handleRoomPhotoUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={handleClearRoomPhoto}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 border border-neutral-700 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              /* No Image Loaded -> Show Sleek Compact Upload Field + Preset Buttons */
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-obsidian-950/80 border border-neutral-800 hover:border-gold-500/30 transition-all">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="py-2 px-4 rounded-xl text-xs font-semibold bg-gold-500/10 text-gold-300 hover:bg-gold-500/20 border border-gold-500/30 cursor-pointer flex items-center gap-2 transition-all shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    Upload Room Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleRoomPhotoUpload} />
                  </label>
                  <span className="text-xs text-neutral-500 hidden md:inline">or choose preset:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_ROOMS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPresetRoom(p)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-obsidian-900 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-300 border border-neutral-800 transition-all"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMaskModalOpen(true)}
                  className="py-2 px-4 rounded-xl font-serif font-semibold text-xs bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 flex items-center justify-center gap-1.5 transition-all shrink-0"
                >
                  Draw Mask Directly ↗
                </button>
              </div>
            )}
          </div>

          {/* Underneath: Architecture and Prompt, both half-width (50% each) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
            {/* Architectural Surface Placement */}
            <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">2</span>
                  Architectural Surface Placement
                </h2>
                <p className="text-xs text-neutral-400">Select surface geometry and architectural placement for mosaic alignment</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                  {PLACEMENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlacement(item.id)}
                      className={`p-3.5 rounded-xl text-xs font-medium transition-all duration-200 border text-center flex flex-col items-center justify-center gap-1 ${
                        placement === item.id
                          ? "bg-gold-500 text-obsidian-950 font-bold border-gold-400 shadow-lg shadow-gold-500/20 scale-[1.02]"
                          : "bg-obsidian-800/80 text-neutral-300 border-neutral-800 hover:border-gold-500/40 hover:text-gold-300"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-950/60 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <span>Selected Placement:</span>
                <span className="text-gold-400 font-semibold font-mono">{placement}</span>
              </div>
            </div>

            {/* Mosaic Prompt & Finish Specs */}
            <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">3</span>
                  Mosaic Prompt & Finish Specs
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-300">Design Vision & Prompt</label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Warm earth tones with a Moroccan zellige-inspired pattern in terracotta and indigo..."
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none"
                  />
                </div>

                {/* TRY SOME INSPIRATION PILLS */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-400" /> Try Some Inspiration:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SCRATCH_INSPIRATIONS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setPrompt(item.prompt)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          prompt === item.prompt
                            ? "bg-gold-500 text-obsidian-950 border-gold-400 font-bold shadow-sm"
                            : "bg-obsidian-950 text-neutral-400 border-neutral-800 hover:border-gold-500/40 hover:text-gold-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
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
                  <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex flex-col gap-2.5">
                    <span>{error}</span>
                    {error.toLowerCase().includes("limit") && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsMyGenerationsOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs cursor-pointer shadow-md"
                        >
                          View My Generations
                        </button>
                        <button
                          type="button"
                          onClick={handleUseDifferentEmail}
                          className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs cursor-pointer"
                        >
                          Use a Different Email
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-obsidian-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}

      {/* AI Generated Result & Material Breakdown Section */}
      {result && (
        <div id="ai-mosaic-result" className="p-8 rounded-3xl bg-obsidian-900/90 border border-gold-500/40 shadow-2xl backdrop-blur-2xl flex flex-col gap-8 animate-fadeIn">
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
        </>
      )}

      {/* Mosaic Finder Teaser Banner */}
      <MosaicFinderBanner />

      {/* Inspiration Masonry Gallery - dynamically loaded from Catalog products */}
      <InspirationGallery 
        products={initialProducts} 
        onSelectPrompt={(newPrompt, prodId) => {
          setPrompt(newPrompt);
          if (prodId) setSelectedProductId(prodId);
        }} 
      />

      {/* OTP Email Verification Modal */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerified={handleOtpVerified}
      />

      {/* Inpainting Mask Tool Modal Popup */}
      <InpaintingMaskModal
        isOpen={isMaskModalOpen}
        onClose={() => setIsMaskModalOpen(false)}
        canvasRef={canvasRef}
        onImageUploaded={(hasImg, previewUrl) => {
          if (previewUrl) {
            setRoomPhotoUrl(previewUrl);
          }
        }}
        onMaskDrawn={() => setHasDrawnMask(true)}
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

      {/* User My Generations History Modal */}
      {verifiedEmail && (
        <MyGenerationsModal
          isOpen={isMyGenerationsOpen}
          onClose={() => setIsMyGenerationsOpen(false)}
          email={verifiedEmail}
          onSelectGeneration={handleSelectGeneration}
        />
      )}
    </div>
  );
}
