"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CanvasDraw, CanvasDrawRef } from "./CanvasDraw";
import { EmailOtpModal } from "./EmailOtpModal";
import { InpaintingMaskModal } from "./InpaintingMaskModal";
import { SpecialistModal } from "./SpecialistModal";
import { InquiryModal } from "@/components/InquiryModal";
import { InspirationGallery, GalleryItem } from "./InspirationGallery";
import { MosaicFinderBanner } from "./MosaicFinderBanner";
import { GenerationWorkingScreen } from "./GenerationWorkingScreen";
import { UserAccountMenu } from "./UserAccountMenu";
import { MyGenerationsModal } from "./MyGenerationsModal";
import { Sparkles, Layers, Sliders, CheckCircle2, DollarSign, Grid, ArrowRight, Loader2, RefreshCw, Send, PhoneCall, ShieldCheck, Plus, Scan, Target, Check, Download } from "lucide-react";
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

export interface PlacementInspiration {
  label: string;
  prompt: string;
}

export const FIXED_ARTISAN_DIRECTIONS: PlacementInspiration[] = [
  {
    label: "Calacatta Sunburst",
    prompt: "Classical Italian Calacatta gold medallion with central sunburst motif, laurel wreath border, and antiqued marble tesserae"
  },
  {
    label: "Baroque Gold Scroll",
    prompt: "Baroque golden scrollwork medallion with black Belgian marble border and polished brass inlay accents"
  },
  {
    label: "Starburst Mandala",
    prompt: "Geometric starburst mandala in Thassos white, Emperador dark marble, and polished 24k gold leaf tesserae"
  },
  {
    label: "Celestial Compass",
    prompt: "Celestial compass rose floor medallion in French limestone, polished black onyx, and lapis lazuli accents"
  }
];

export const PLACEMENT_INSPIRATIONS: Record<string, PlacementInspiration[]> = {
  "Floor Medallion": FIXED_ARTISAN_DIRECTIONS,
};

export function getInspirationsForPlacement(_placementName?: string): PlacementInspiration[] {
  return FIXED_ARTISAN_DIRECTIONS;
}

const PLACEMENTS = [
  { id: "Auto-detect", label: "Auto-detect Space", hint: "AI identifies best surface" },
  { id: "Floor Medallion", label: "Floor Medallion", hint: "Inlays into floor plane" },
  { id: "Backsplash", label: "Backsplash", hint: "Inlays onto counter/wall" },
  { id: "Accent Wall", label: "Accent Wall", hint: "Full vertical mural" },
  { id: "Pool", label: "Pool & Wellness", hint: "Waterline & pool basin" },
  { id: "Entryway", label: "Entryway & Rotunda", hint: "Foyer entrance threshold" },
];

const FINISHES = ["Polished High-Gloss", "Satin Honed", "Antiqued Tumbled", "Textured Matte"];
const GROUT_COLORS = ["Champagne Gold", "Pure Thassos White", "Charcoal Slate", "Platinum Silver"];

export function DesignStudio({ initialProducts = [], startFromScratch = false, initialSelectedProductId, onOpenInquiryModal }: DesignStudioProps) {
  const canvasRef = useRef<CanvasDrawRef>(null);
  const searchParams = useSearchParams();
  const isScratch = startFromScratch || searchParams?.get("mode") === "scratch";

  const [placement, setPlacement] = useState<string>("Floor Medallion");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedDesignItem, setSelectedDesignItem] = useState<GalleryItem | null>(null);
  const [prompt, setPrompt] = useState<string>(
    "Classical Italian Calacatta gold medallion with central sunburst motif, laurel wreath border, and antiqued marble tesserae"
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
  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>(null);
  const [roomPhotoName, setRoomPhotoName] = useState<string | null>(null);
  const [hasDrawnMask, setHasDrawnMask] = useState(false);

  // Dynamic Custom Placements & AI Surface Detection State
  const [customPlacements, setCustomPlacements] = useState<Array<{ id: string; label: string; hint: string }>>([]);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState("");
  const [isDetectingSurface, setIsDetectingSurface] = useState(false);
  const [detectedSurface, setDetectedSurface] = useState<{
    detected: boolean;
    surfaceName: string;
    box_2d: [number, number, number, number];
    polygon?: [number, number][];
    description: string;
    confidence: number;
    perspectiveType?: string;
    architecturalGuideline?: string;
  } | null>(null);

  const SUGGESTED_CUSTOM_SURFACES = [
    { label: "Door Back", hint: "Vertical door panel & frame" },
    { label: "Kitchen Island", hint: "Waterfall counter / island facade" },
    { label: "Fireplace", hint: "Hearth surround & chimney breast" },
    { label: "Shower Niche", hint: "Recessed waterproof feature wall" },
    { label: "Ceiling", hint: "Overhead dome or coffered ceiling" },
  ];

  const triggerSurfaceDetection = async (targetSurfaceName: string, imageBase64Data?: string) => {
    const photoToScan = imageBase64Data || roomPhotoUrl;
    if (!photoToScan) {
      return;
    }

    setIsDetectingSurface(true);
    try {
      const res = await fetch("/api/ai/detect-surface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photoToScan,
          targetSurface: targetSurfaceName,
          designPrompt: prompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.detection) {
          setDetectedSurface(data.detection);
          if (canvasRef.current?.applyDetectedSurfaceMask && data.detection.box_2d) {
            canvasRef.current.applyDetectedSurfaceMask(data.detection.box_2d, data.detection.polygon);
            setHasDrawnMask(true);
          }
        }
      }
    } catch (err) {
      console.warn("AI Surface Detection request failed:", err);
    } finally {
      setIsDetectingSurface(false);
    }
  };

  const handlePlacementSelect = (selectedId: string) => {
    setPlacement(selectedId);
    triggerSurfaceDetection(selectedId);
  };

  const handleAddCustomPlacement = (nameToAdd?: string) => {
    const name = (nameToAdd || customInputText).trim();
    if (!name) return;

    const existing = [...PLACEMENTS, ...customPlacements].find(
      (p) => p.id.toLowerCase() === name.toLowerCase() || p.label.toLowerCase() === name.toLowerCase()
    );

    if (!existing) {
      const newPlacement = {
        id: name,
        label: name,
        hint: "Bespoke custom surface",
      };
      setCustomPlacements((prev) => [...prev, newPlacement]);
    }

    setPlacement(name);
    setCustomInputText("");
    setIsCustomInputOpen(false);
    triggerSurfaceDetection(name);
  };

  const handleSelectDesign = (item: GalleryItem) => {
    // 1. Set prompt
    const newPrompt = item.desc || item.title;
    setPrompt(newPrompt);

    // 2. Set product & design item
    if (item.id) {
      setSelectedProductId(item.id);
    }
    setSelectedDesignItem(item);

    // 3. Auto-detect placement from category and title
    const titleAndCat = `${item.title} ${item.category || ""}`.toLowerCase();
    let targetPlacement = "Floor Medallion";

    if (titleAndCat.includes("pool") || titleAndCat.includes("spa")) {
      targetPlacement = "Pool";
    } else if (titleAndCat.includes("backsplash") || titleAndCat.includes("kitchen")) {
      targetPlacement = "Backsplash";
    } else if (titleAndCat.includes("wall") || titleAndCat.includes("mural") || titleAndCat.includes("portrait") || titleAndCat.includes("zellige")) {
      targetPlacement = "Accent Wall";
    } else if (titleAndCat.includes("door")) {
      targetPlacement = "Door Back";
    } else if (titleAndCat.includes("fireplace") || titleAndCat.includes("hearth")) {
      targetPlacement = "Fireplace";
    } else if (titleAndCat.includes("ceiling") || titleAndCat.includes("dome")) {
      targetPlacement = "Ceiling";
    } else if (titleAndCat.includes("island")) {
      targetPlacement = "Kitchen Island";
    } else if (titleAndCat.includes("entry") || titleAndCat.includes("foyer") || titleAndCat.includes("rotunda")) {
      targetPlacement = "Entryway";
    } else {
      targetPlacement = "Floor Medallion";
    }

    setPlacement(targetPlacement);

    // 4. In Customize Mode: Load this inspiration space photo into Section 1 & Canvas!
    if (!isScratch && item.image) {
      setRoomPhotoUrl(item.image);
      setRoomPhotoName(`${item.title} (Inspiration Space)`);
      setHasDrawnMask(false);
      setDetectedSurface(null);

      // Stream into canvas through proxy to prevent cross-origin canvas tainting
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(item.image)}`;
      canvasRef.current?.loadCustomImage?.(proxyUrl);

      // Trigger AI surface detection on the new space photo
      triggerSurfaceDetection(targetPlacement, proxyUrl);
    }

    // Scroll smoothly to top
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      triggerSurfaceDetection(placement, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearRoomPhoto = () => {
    setRoomPhotoUrl(null);
    setRoomPhotoName(null);
    setHasDrawnMask(false);
    setDetectedSurface(null);
    canvasRef.current?.clearCanvas();
  };

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isWorkingScreenOpen, setIsWorkingScreenOpen] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadImage = async (url: string, filename?: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || `zakiah-mosaic-${placement.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `zakiah-mosaic-${placement.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
          localStorage.setItem("zm_verified_email", urlEmail);
          localStorage.setItem("mec_verified_email", urlEmail);
          window.dispatchEvent(new Event("zm_verified_email_updated"));
          window.dispatchEvent(new Event("mec_verified_email_updated"));
        }
      }
    }
  }, [searchParams]);

  // Sync verified email from localStorage on initial load & updates
  useEffect(() => {
    const syncEmail = () => {
      const stored = typeof window !== "undefined"
        ? localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email")
        : null;
      if (stored) {
        setIsOtpVerified(true);
        setVerifiedEmail(stored);
      }
    };
    syncEmail();
    window.addEventListener("zm_verified_email_updated", syncEmail);
    window.addEventListener("mec_verified_email_updated", syncEmail);
    return () => {
      window.removeEventListener("zm_verified_email_updated", syncEmail);
      window.removeEventListener("mec_verified_email_updated", syncEmail);
    };
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
    setIsWorkingScreenOpen(true);
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
      let inputImageUrl: string | null = null;
      if (!isScratch) {
        if (roomPhotoUrl && roomPhotoUrl.startsWith("data:image")) {
          inputImageBase64 = roomPhotoUrl;
        } else if (canvasRef.current?.getInputImageBase64) {
          inputImageBase64 = canvasRef.current.getInputImageBase64();
        } else if (roomPhotoUrl && (roomPhotoUrl.startsWith("http://") || roomPhotoUrl.startsWith("https://"))) {
          inputImageUrl = roomPhotoUrl;
        }
      }

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          placement,
          productId: selectedProductId || selectedDesignItem?.id || undefined,
          referenceProductImageUrl: selectedDesignItem?.image || selectedProduct?.sampleImageUrl || undefined,
          referenceProductTitle: selectedDesignItem?.title || selectedProduct?.title || undefined,
          referenceProductCategory: selectedDesignItem?.category || selectedProduct?.category || undefined,
          inputImageBase64,
          inputImageUrl,
          maskBase64,
          finish,
          groutColor,
          surfaceDetection: detectedSurface || undefined,
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
      setIsWorkingScreenOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOtpVerified = (emailVerified: string) => {
    setIsOtpVerified(true);
    setVerifiedEmail(emailVerified);
    if (typeof window !== "undefined") {
      localStorage.setItem("zm_verified_email", emailVerified);
      localStorage.setItem("mec_verified_email", emailVerified);
      window.dispatchEvent(new Event("zm_verified_email_updated"));
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
    // Directly launch into the image generation phase
    executeGeneration();
  };

  const handleUseDifferentEmail = () => {
    setIsOtpVerified(false);
    setVerifiedEmail("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("zm_verified_email");
      localStorage.removeItem("mec_verified_email");
      window.dispatchEvent(new Event("zm_verified_email_updated"));
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
      {isWorkingScreenOpen ? (
        <GenerationWorkingScreen
          prompt={prompt}
          placement={placement}
          roomPhotoUrl={roomPhotoUrl}
          roomPhotoName={roomPhotoName}
          finish={finish}
          groutColor={groutColor}
          isGenerating={isGenerating}
          result={result}
          onCancel={() => {
            setIsGenerating(false);
            setIsWorkingScreenOpen(false);
          }}
          onDownload={() => {
            if (result?.resultImageUrl) {
              handleDownloadImage(
                result.resultImageUrl,
                `zakiah-mosaic-${placement.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`
              );
            }
          }}
          onRequestQuote={() => setIsQuoteModalOpen(true)}
          onRequestSpecialist={() => setIsSpecialistModalOpen(true)}
          onBackToStudio={() => setIsWorkingScreenOpen(false)}
          onSelectPlacement={(newPlacement) => {
            setPlacement(newPlacement);
            triggerSurfaceDetection(newPlacement);
          }}
          onReplacePhoto={() => {
            setIsWorkingScreenOpen(false);
          }}
        />
      ) : (
        <>
          {isScratch ? (
        /* ==================== IMAGINE FROM SCRATCH MODE ==================== */
        <div className="w-full flex flex-col gap-8">
          {/* Scratch Studio Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-gold-500/5">
              <Sparkles className="w-3.5 h-3.5" /> Zakiah Mosaics • Generative Concept Studio
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
              Generative Architectural Mosaic Studio
            </h1>
            <p className="text-sm md:text-base text-neutral-400 max-w-xl">
              Articulate your architectural vision — our studio synthesizes bespoke, artisan-grade mosaic concepts in authentic Italian marble, Venetian smalti, and 24k gold leaf.
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
              {/* Active Inspiration Reference Design Badge if chosen */}
              {selectedDesignItem && (
                <div className="p-3.5 rounded-xl bg-obsidian-950/90 border border-gold-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gold-500/40 shrink-0 bg-obsidian-900">
                      <img
                        src={selectedDesignItem.image}
                        alt={selectedDesignItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold-400" /> Active Inspiration Design Reference
                      </span>
                      <span className="text-sm font-serif font-bold text-white line-clamp-1">
                        {selectedDesignItem.title}
                      </span>
                      {selectedDesignItem.category && (
                        <span className="text-[11px] text-neutral-400">
                          {selectedDesignItem.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDesignItem(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-red-300 hover:bg-red-950/30 border border-neutral-800 transition-colors"
                  >
                    Clear Reference
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Artistic Vision & Mosaic Specifications</span>
                  <span className="text-gold-400/80 uppercase text-[11px] font-mono">Bespoke Generative Synthesis</span>
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Classical Italian Calacatta gold medallion with central sunburst motif, laurel wreath border, and antiqued marble tesserae..."
                  className="w-full p-4 rounded-xl bg-obsidian-950/80 border border-neutral-800 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none leading-relaxed font-light"
                  autoFocus
                />
              </div>

              {/* Surface Placement Selector */}
              <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Architectural Surface Placement
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLACEMENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlacement(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
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
                      Render Bespoke Mosaic Concept
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Inspiration Pills Strip */}
            <div className="bg-obsidian-950 px-6 py-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-400 flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> Curated Studio Directions:
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
              <Sparkles className="w-3.5 h-3.5" /> Zakiah Mosaics • Architectural Surface Studio
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-white drop-shadow-md">
              Architectural Mosaic Space Visualizer
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 max-w-2xl">
              Upload architectural photography and define target surface boundaries to render authentic, high-precision luxury mosaics aligned with your space geometry.
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
                Architectural Photography & Surface Masking
              </h2>
              <span className="text-xs text-neutral-400">Define precise surface boundaries for architectural integration</span>
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
                        detectedSurface
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : hasDrawnMask
                          ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                          : selectedDesignItem?.image === roomPhotoUrl
                          ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {detectedSurface
                          ? `✓ AI Detected: ${detectedSurface.surfaceName}`
                          : hasDrawnMask
                          ? "✓ Inpainting Mask Active"
                          : selectedDesignItem?.image === roomPhotoUrl
                          ? "✓ Inspiration Space Loaded"
                          : "Full Space Selected"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => triggerSurfaceDetection(placement)}
                    disabled={isDetectingSurface}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 hover:text-gold-200 border border-gold-500/30 transition-all flex items-center gap-1.5"
                    title="Detect surface on photo with AI Vision"
                  >
                    {isDetectingSurface ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scan className="w-3.5 h-3.5" />}
                    AI Detect
                  </button>
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
              /* No Image Loaded -> Show Sleek Upload Field & Mask Trigger */
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-obsidian-950/80 border border-neutral-800 hover:border-gold-500/30 transition-all">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="py-2 px-4 rounded-xl text-xs font-semibold bg-gold-500/10 text-gold-300 hover:bg-gold-500/20 border border-gold-500/30 cursor-pointer flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    Upload Architectural Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleRoomPhotoUpload} />
                  </label>
                  <span className="text-xs text-neutral-400">
                    Upload interior, pool, facade, or rotunda photography for automatic surface detection
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMaskModalOpen(true)}
                  className="py-2 px-4 rounded-xl font-serif font-semibold text-xs bg-obsidian-800 hover:bg-obsidian-700 text-gold-300 border border-gold-500/30 flex items-center justify-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Precision Mask Editor ↗
                </button>
              </div>
            )}
          </div>

          {/* Underneath: Architecture and Prompt, both half-width (50% each) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
            {/* Architectural Surface Placement */}
            <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">2</span>
                    Architectural Surface Placement
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCustomInputOpen((prev) => !prev)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Custom Surface
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Select target surface geometry — AI scans perspective planes and aligns tesserae to your space
                </p>
              </div>

              {/* Dynamic Custom Surface Entry Bar */}
              {isCustomInputOpen && (
                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-gold-500/30 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customInputText}
                      onChange={(e) => setCustomInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomPlacement();
                        }
                      }}
                      placeholder="e.g. Door Back, Kitchen Island, Fireplace..."
                      className="flex-1 p-2 rounded-lg bg-obsidian-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomPlacement()}
                      disabled={!customInputText.trim()}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-obsidian-950 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Scan className="w-3.5 h-3.5" /> Add & Detect
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-mono">Quick Suggestions:</span>
                    {SUGGESTED_CUSTOM_SURFACES.map((sug) => (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => handleAddCustomPlacement(sug.label)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-obsidian-900 text-neutral-300 border border-neutral-800 hover:border-gold-500/40 hover:text-gold-300 transition-all"
                      >
                        + {sug.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Surface Option Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                {[...PLACEMENTS, ...customPlacements].map((item) => {
                  const isSelected = placement === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePlacementSelect(item.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 border text-center flex items-center justify-center truncate cursor-pointer ${
                        isSelected
                          ? "bg-gold-500 text-obsidian-950 font-bold border-gold-400 shadow-md shadow-gold-500/20 scale-[1.02]"
                          : "bg-obsidian-800/80 text-neutral-300 border-neutral-800 hover:border-gold-500/40 hover:text-gold-300"
                      }`}
                      title={item.label}
                    >
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Placement Indicator */}
              <div className="p-3 rounded-xl bg-obsidian-950/60 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <span>Selected Placement:</span>
                <span className="text-gold-400 font-semibold font-mono">{placement}</span>
              </div>
            </div>

            {/* Mosaic Prompt & Finish Specs */}
            <div className="p-6 rounded-2xl bg-obsidian-900/80 border border-gold-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs flex items-center justify-center border border-gold-500/30">3</span>
                  Design Direction & Artisan Specifications
                </h2>

                {/* Active Inspiration Reference Design Card */}
                {selectedDesignItem && (
                  <div className="p-3.5 rounded-xl bg-obsidian-950/90 border border-gold-500/40 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gold-500/40 shrink-0 bg-obsidian-900">
                        <img
                          src={selectedDesignItem.image}
                          alt={selectedDesignItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold-400" /> Active Inspiration Design Reference
                        </span>
                        <span className="text-xs font-serif font-bold text-white line-clamp-1">
                          {selectedDesignItem.title}
                        </span>
                        {selectedDesignItem.category && (
                          <span className="text-[10px] text-neutral-400">
                            {selectedDesignItem.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDesignItem(null)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-400 hover:text-red-300 hover:bg-red-950/30 border border-neutral-800 transition-colors"
                      title="Clear reference design"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-300">Artistic Vision & Mosaic Prompt</label>
                    <button
                      type="button"
                      onClick={() => {
                        const enhanced = `Ultra-luxurious bespoke architectural mosaic artwork for ${placement}. ${prompt.trim().replace(/\.+$/, "")}. Handcrafted by Zakiah Mosaics from authentic Italian marble tesserae and Venetian smalti in ${finish.toLowerCase()} finish with luminous ${groutColor.toLowerCase()} grout lines, scaled in true architectural perspective.`;
                        setPrompt(enhanced);
                      }}
                      className="text-[11px] font-mono text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors group"
                      title="Enrich prompt with architectural specs"
                    >
                      <Sparkles className="w-3 h-3 text-gold-400 group-hover:rotate-12 transition-transform" /> AI Enhance Prompt
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Warm earth tones with a Moroccan zellige-inspired pattern in terracotta and indigo..."
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none"
                  />
                </div>

                {/* FIXED ARTISAN DIRECTIONS - Kept constant across all surface selections */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-400" /> Artisan Directions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FIXED_ARTISAN_DIRECTIONS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setPrompt(item.prompt)}
                        title={item.prompt}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
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

                {/* AI Multimodal Vision Detection Status Card (Now positioned in Module 3 with Prompt) */}
                {roomPhotoUrl ? (
                  isDetectingSurface ? (
                    <div className="p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 text-gold-400 animate-spin shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gold-300">AI Multimodal Vision Scanning...</span>
                          <span className="text-[10px] text-neutral-400">Locating &ldquo;{placement}&rdquo; architectural plane on your photo</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gold-400/80">Gemini 3.5</span>
                    </div>
                  ) : detectedSurface ? (
                    <div className="p-3 rounded-xl bg-obsidian-950/90 border border-gold-500/30 flex flex-col gap-2 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                          <span className="text-xs font-semibold text-white">
                            AI Detected: <span className="text-gold-300 font-mono">{detectedSurface.surfaceName}</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            {Math.round((detectedSurface.confidence || 0.95) * 100)}% match
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerSurfaceDetection(placement)}
                          disabled={isDetectingSurface}
                          className="text-[10px] font-mono text-neutral-400 hover:text-gold-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Re-scan surface"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Re-scan
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-300 line-clamp-2">
                        {detectedSurface.description}
                      </p>
                      <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400">
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          ✓ Gold Mask Auto-Aligned on Surface
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsMaskModalOpen(true)}
                          className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-2 flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          Preview / Adjust Mask ↗
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-obsidian-950/40 border border-neutral-800/60 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1.5">
                        <Scan className="w-3.5 h-3.5 text-gold-400" /> AI Vision surface detection ready for &ldquo;{placement}&rdquo;
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerSurfaceDetection(placement)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 transition-all cursor-pointer"
                      >
                        Detect Surface
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-xl bg-obsidian-950/40 border border-neutral-800/60 flex items-center gap-2 text-[11px] text-neutral-400">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Upload an architectural photo in Section 1 to enable AI surface detection & auto-masking.</span>
                  </div>
                )}

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
                    Synthesizing Mosaic Architecture...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-obsidian-950 fill-obsidian-950" />
                    Render Bespoke Mosaic Surface
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
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> Artisan Architectural Surface Render Complete
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Bespoke Mosaic Surface Visualization</h2>
            </div>

            {/* FRONTEND ACTION BUTTONS: Download, Quote Request & Talk to Specialist */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (result?.resultImageUrl) {
                    handleDownloadImage(
                      result.resultImageUrl,
                      `zakiah-mosaic-${placement.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`
                    );
                  }
                }}
                className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download High-Res Image
              </button>

              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-gold-500/40 text-gold-300 font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Request Sample Box & Specification
              </button>

              <button
                type="button"
                onClick={() => setIsSpecialistModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-neutral-700 text-neutral-300 hover:text-white font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-gold-400" /> Speak with a Surface Specialist
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
                  <span className="text-gold-400 font-bold">Artisan Specification:</span> {result.promptApplied}
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
                  <span className="text-[10px] text-neutral-400 block mt-1">*Includes precision waterjet cut tesserae, fiberglass mesh mounting, and bespoke wooden crating.</span>
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
        onSelectDesign={handleSelectDesign}
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
