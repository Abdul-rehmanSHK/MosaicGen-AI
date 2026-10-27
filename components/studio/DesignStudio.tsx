"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CanvasDraw, CanvasDrawRef } from "./CanvasDraw";
import { EmailOtpModal } from "./EmailOtpModal";
import { InpaintingMaskModal } from "./InpaintingMaskModal";
import { SpecialistModal } from "./SpecialistModal";
import { InquiryModal } from "@/components/InquiryModal";
import { InspirationGallery, GalleryItem } from "./InspirationGallery";
import { MosaicFinderBanner } from "./MosaicFinderBanner";
import { GenerationWorkingScreen } from "./GenerationWorkingScreen";
import { MyGenerationsModal } from "./MyGenerationsModal";
import { LimitReachedModal } from "./LimitReachedModal";
import { Sparkles, Layers, Sliders, CheckCircle2, DollarSign, Grid, ArrowRight, ArrowUp, Upload, Shield, Loader2, RefreshCw, Send, PhoneCall, ShieldCheck, Plus, Scan, Target, Check, Download, Maximize2, X } from "lucide-react";
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
  { id: "Auto-detect", label: "Auto-detect", hint: "AI identifies best surface" },
  { id: "Backsplash", label: "Backsplash", hint: "Inlays onto counter/wall" },
  { id: "Accent Wall", label: "Accent wall", hint: "Full vertical mural" },
  { id: "Floor Medallion", label: "Floor medallion", hint: "Inlays into floor plane" },
  { id: "Pool", label: "Pool", hint: "Waterline & pool basin" },
  { id: "Entryway", label: "Entryway", hint: "Foyer entrance threshold" },
];

const FINISHES = ["Polished High-Gloss", "Satin Honed", "Antiqued Tumbled", "Textured Matte"];
const GROUT_COLORS = ["Champagne Gold", "Pure Thassos White", "Charcoal Slate", "Platinum Silver"];

export function DesignStudio({ initialProducts = [], startFromScratch = false, initialSelectedProductId, onOpenInquiryModal }: DesignStudioProps) {
  const canvasRef = useRef<CanvasDrawRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isScratch = startFromScratch || searchParams?.get("mode") === "scratch";

  const [placement, setPlacement] = useState<string>("Auto-detect");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedDesignItem, setSelectedDesignItem] = useState<GalleryItem | null>(null);
  const [prompt, setPrompt] = useState<string>(
    "Iridescent sea-glass mosaic with a soft flowing wave motif"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [finish, setFinish] = useState<string>("Polished High-Gloss");
  const [groutColor, setGroutColor] = useState<string>("Champagne Gold");

  // OTP Verification State & Free Previews Quota
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [generationsTrigger, setGenerationsTrigger] = useState(0);
  const [isMyGenerationsOpen, setIsMyGenerationsOpen] = useState(false);
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false);
  const [limitModalEmail, setLimitModalEmail] = useState("");

  // Modal State for Result Action Buttons
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);
  const [isResultLightboxOpen, setIsResultLightboxOpen] = useState(false);

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

  const processUploadedFile = (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size exceeds the 10 MB limit.");
      return;
    }
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

  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
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

  // Sync verified email from localStorage & active session on initial load & updates
  useEffect(() => {
    const syncEmail = () => {
      const stored = typeof window !== "undefined"
        ? localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email")
        : null;
      if (stored) {
        setIsOtpVerified(true);
        setVerifiedEmail(stored);
      } else if (session?.user?.email) {
        const sessEmail = session.user.email.toLowerCase().trim();
        setIsOtpVerified(true);
        setVerifiedEmail(sessEmail);
        if (typeof window !== "undefined") {
          localStorage.setItem("zm_verified_email", sessEmail);
        }
      } else {
        setIsOtpVerified(false);
        setVerifiedEmail("");
      }
    };
    syncEmail();
    window.addEventListener("zm_verified_email_updated", syncEmail);
    window.addEventListener("mec_verified_email_updated", syncEmail);
    return () => {
      window.removeEventListener("zm_verified_email_updated", syncEmail);
      window.removeEventListener("mec_verified_email_updated", syncEmail);
    };
  }, [session]);

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

  const executeGeneration = async (overrideEmail?: string) => {
    setIsWorkingScreenOpen(true);
    setIsGenerating(true);
    setResult(null);
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 80, behavior: "smooth" });
    }

    const emailToSend =
      overrideEmail ||
      verifiedEmail ||
      (typeof window !== "undefined"
        ? localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email") || undefined
        : undefined);

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
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("zm_verified_token")
            ? { "x-verified-token": localStorage.getItem("zm_verified_token")! }
            : {}),
        },
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
          email: emailToSend,
          verifiedToken:
            typeof window !== "undefined"
              ? localStorage.getItem("zm_verified_token") || undefined
              : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 403 &&
          (data.error === "LIMIT_REACHED" || (data.message && data.message.toLowerCase().includes("limit")))
        ) {
          setIsWorkingScreenOpen(false);
          setIsGenerating(false);
          setError(null);
          setLimitModalEmail(emailToSend || verifiedEmail || data.email || "");
          setIsLimitReachedModalOpen(true);
          return;
        }
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
      if (err.message && err.message.toLowerCase().includes("limit")) {
        setError(null);
        setLimitModalEmail(emailToSend || verifiedEmail || "");
        setIsLimitReachedModalOpen(true);
      } else {
        setError(err.message || "An error occurred while generating the design.");
      }
      setIsWorkingScreenOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOtpVerified = (emailVerified: string) => {
    setIsLimitReachedModalOpen(false);
    setIsOtpVerified(true);
    setVerifiedEmail(emailVerified);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("zm_verified_email", emailVerified);
      localStorage.setItem("mec_verified_email", emailVerified);
      window.dispatchEvent(new Event("zm_verified_email_updated"));
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
    // Directly launch into the image generation phase with the verified email
    executeGeneration(emailVerified);
  };

  const handleUseDifferentEmail = () => {
    setIsLimitReachedModalOpen(false);
    setIsOtpVerified(false);
    setVerifiedEmail("");
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("zm_verified_email");
      localStorage.removeItem("mec_verified_email");
      localStorage.removeItem("zm_verified_token");
      document.cookie = "zm_verified_token=; path=/; max-age=0";
      document.cookie = "zm_verified_email=; path=/; max-age=0";
      window.dispatchEvent(new Event("zm_verified_email_updated"));
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
    // Prompt the user to enter their new email immediately
    setIsOtpModalOpen(true);
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

  useEffect(() => {
    const handleGlobalSelect = (e: any) => {
      if (e?.detail) {
        handleSelectGeneration(e.detail);
      }
    };
    window.addEventListener("zm_select_generation", handleGlobalSelect);
    return () => window.removeEventListener("zm_select_generation", handleGlobalSelect);
  }, []);

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
        <div className="w-full flex flex-col gap-6">
          {/* Scratch Studio Header */}
          <div className="text-center flex flex-col items-center gap-2 pt-2 pb-1">
            <div className="inline-flex items-center gap-1.5 text-stone-500 text-[11px] font-medium tracking-[0.22em] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-stone-500" /> IMAGINE FROM SCRATCH
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-normal tracking-tight text-stone-900">
              Generative Architectural Mosaic Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xl">
              Articulate your architectural vision — synthesize bespoke, artisan-grade mosaic concepts in authentic Italian marble, Venetian smalti, and 24k gold leaf.
            </p>
          </div>

          {/* Unified Luxury Prompt Card */}
          <div className="w-full max-w-4xl mx-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm overflow-hidden flex flex-col transition-all">
            <div className="p-5 sm:p-7 flex flex-col gap-5">
              {/* Active Inspiration Reference Design Badge if chosen */}
              {selectedDesignItem && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                      <img
                        src={selectedDesignItem.image}
                        alt={selectedDesignItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-stone-500" /> Active Inspiration Design Reference
                      </span>
                      <span className="text-sm font-serif font-bold text-stone-900 line-clamp-1">
                        {selectedDesignItem.title}
                      </span>
                      {selectedDesignItem.desc ? (
                        <p className="text-[11px] text-stone-500 line-clamp-1 max-w-md font-light">
                          {selectedDesignItem.desc}
                        </p>
                      ) : selectedDesignItem.category ? (
                        <span className="text-[11px] text-stone-500">
                          {selectedDesignItem.category}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDesignItem(null)}
                    className="px-3 py-1.5 rounded-full text-xs font-mono text-stone-500 hover:text-red-600 hover:bg-stone-100 border border-stone-200 transition-colors"
                  >
                    Clear Reference
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Artistic Vision & Mosaic Specifications</span>
                  <span className="text-stone-400 uppercase text-[11px] font-mono">Bespoke Generative Synthesis</span>
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Classical Italian Calacatta gold medallion with central sunburst motif, laurel wreath border, and antiqued marble tesserae..."
                  className="w-full p-4 rounded-xl bg-stone-50/70 border border-stone-200 text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-700 transition-all resize-none leading-relaxed font-light"
                  autoFocus
                />
              </div>

              {/* Surface Placement Selector */}
              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Architectural Surface Placement
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLACEMENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlacement(item.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer font-medium ${
                        placement === item.id
                          ? "bg-stone-900 text-white font-semibold shadow-xs"
                          : "bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 border border-transparent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && !error.toLowerCase().includes("limit") && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2">
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-full sm:w-auto py-3 px-7 rounded-full font-serif font-medium text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Rendering Mosaic Concept...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Render Bespoke Mosaic Concept
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Inspiration Pills Strip */}
            <div className="bg-stone-50/70 px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-stone-500" /> Curated Directions:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SCRATCH_INSPIRATIONS.map((insp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(insp.prompt)}
                    className="px-3 py-1 rounded-full text-xs bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 transition-all font-medium cursor-pointer"
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
          {/* Studio Header Banner matching Screenshot 3 */}
          <div className="text-center flex flex-col items-center gap-2 pt-2 pb-1">
            <div className="inline-flex items-center gap-1.5 text-stone-500 text-[11px] font-medium tracking-[0.22em] uppercase">
              <Layers className="w-3.5 h-3.5 text-stone-500" /> CUSTOMIZE YOUR SPACE
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-normal tracking-tight text-stone-900">
              AI Mosaic Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xl">
              Upload a photo of your space — see a bespoke mosaic rendered into it.
            </p>
          </div>

          {/* Screenshot 3 Unified Studio Banner Card */}
          <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white border border-stone-200/90 shadow-sm p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 transition-all">
            {/* Upload Box: Dashed border with thumbnail, title, subtitle, shield note & upload button */}
            <div className="w-full rounded-xl border border-dashed border-stone-300/90 bg-stone-50/40 hover:bg-stone-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-2xs flex items-center justify-center">
                  {roomPhotoUrl ? (
                    <img
                      src={roomPhotoUrl}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/Mask-group-residential.webp"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
                      }}
                      alt="Room space placeholder"
                      className="w-full h-full object-cover opacity-90"
                    />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <h3 className="text-sm sm:text-base font-medium text-stone-900">
                    Upload a photo of your space
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Drop an image or click to choose · JPEG, PNG, WebP · up to 10 MB
                  </p>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                    Used only to render this preview. Not stored.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {roomPhotoUrl ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMaskModalOpen(true)}
                      className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-800 bg-white text-xs font-medium text-stone-700 hover:text-stone-900 transition-all flex items-center gap-1 cursor-pointer"
                      title="Adjust inpainting mask"
                    >
                      <Scan className="w-3 h-3 text-stone-500" /> Mask Editor ↗
                    </button>
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-full border border-stone-200 hover:border-stone-800 bg-white text-xs font-medium text-stone-700 hover:text-stone-900 transition-all shadow-2xs">
                      Change
                      <input type="file" accept="image/*" className="hidden" onChange={handleRoomPhotoUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={handleClearRoomPhoto}
                      className="px-2.5 py-1.5 rounded-full text-xs text-stone-400 hover:text-red-600 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-stone-300 hover:border-stone-800 bg-white hover:bg-stone-100 text-[11px] sm:text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all active:scale-95">
                    UPLOAD IMAGE
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleRoomPhotoUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Prompt Input Row */}
            <div className="w-full relative pt-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Iridescent sea-glass mosaic with a soft flowing wave motif"
                className="w-full py-2.5 px-1 sm:px-2 text-sm sm:text-base text-stone-800 placeholder-stone-400 bg-transparent border-0 border-b border-stone-200 focus:border-stone-700 focus:outline-none transition-colors font-light"
              />
            </div>

            {/* Where Should It Go? Pills & Circular ArrowUp Submit Button */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-stone-400">
                WHERE SHOULD IT GO?
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {PLACEMENTS.map((item) => {
                    const isSelected = placement === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePlacementSelect(item.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer font-medium ${
                          isSelected
                            ? "bg-white text-stone-900 border border-stone-800 shadow-2xs font-semibold"
                            : "bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 border border-transparent hover:border-stone-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-300 hover:bg-stone-900 text-stone-700 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 ml-auto cursor-pointer"
                  title="Generate bespoke mosaic"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && !error.toLowerCase().includes("limit") && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Carousel dots indicator below banner (as seen in Screenshot 3) */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            <span className="w-6 h-1 rounded-full bg-stone-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
          </div>
        </div>
      )}

      {/* AI Generated Result & Material Breakdown Section */}
      {result && (
        <div id="ai-mosaic-result" className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xl flex flex-col gap-8 animate-fadeIn text-stone-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Artisan Architectural Surface Render Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-stone-900">Bespoke Mosaic Surface Visualization</h2>
            </div>

            {/* FRONTEND ACTION BUTTONS: Download, Quote Request & Talk to Specialist */}
            <div className="flex flex-wrap items-center gap-2.5">
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
                className="px-4 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-serif font-medium text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download High-Res
              </button>

              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-serif font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" /> Request Sample Box
              </button>

              <button
                type="button"
                onClick={() => setIsSpecialistModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-serif font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-stone-600" /> Speak with Specialist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative w-full h-[450px] sm:h-[480px] rounded-2xl overflow-hidden border border-stone-200 shadow-lg bg-stone-100 group">
              <img
                src={result.resultImageUrl}
                alt="AI Generated Mosaic Surface"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <button
                type="button"
                onClick={() => setIsResultLightboxOpen(true)}
                className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                title="View Maximize / High-Resolution"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-sm">
                <p className="text-xs text-stone-700 font-serif italic line-clamp-2">
                  <span className="font-sans not-italic font-semibold text-stone-900">Artisan Specification:</span> {result.promptApplied}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5 bg-stone-50/70 p-6 rounded-2xl border border-stone-200/90">
              <h3 className="text-base font-serif font-semibold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
                <Grid className="w-4 h-4 text-stone-700" /> Architectural Material Estimation
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 block mb-1">Estimated Area</span>
                  <span className="text-xl font-bold font-serif text-stone-900">{result.estimatedSqFt} sq.ft</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 block mb-1">Mosaic Chips</span>
                  <span className="text-xl font-bold font-serif text-stone-900">{result.estimatedTileCount.toLocaleString()}</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-100 border border-stone-300/80 col-span-2 shadow-2xs">
                  <span className="text-xs text-stone-600 font-medium block mb-1">Estimated Material Cost</span>
                  <span className="text-3xl font-serif font-bold text-stone-900">${result.estimatedMaterialCost.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-500 block mt-1">*Includes precision waterjet cut tesserae, fiberglass mesh mounting, and bespoke wooden crating.</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">Selected Style:</span>
                  <span className="font-semibold text-stone-900">{selectedProduct?.title || "Bespoke Italian"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Surface Placement:</span>
                  <span className="font-semibold text-stone-900">{placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Finish / Grout:</span>
                  <span className="font-semibold text-stone-900">{finish} • {groutColor}</span>
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

      {/* High-Resolution Result Image Maximize Lightbox Modal */}
      {isResultLightboxOpen && result?.resultImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsResultLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-stone-900 transition-colors cursor-pointer"
              title="Close Fullscreen View"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-h-[80vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center bg-stone-950">
              <img
                src={result.resultImageUrl}
                alt="Fullscreen Mosaic Render"
                className="w-full h-full max-h-[80vh] object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
                }}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleDownloadImage(
                    result.resultImageUrl,
                    `zakiah-mosaic-${placement.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`
                  );
                }}
                className="px-6 py-2.5 rounded-full bg-white text-stone-900 font-serif font-bold text-xs flex items-center gap-2 hover:bg-stone-200 transition-all cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" /> Download Full Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User My Generations History Modal */}
      <MyGenerationsModal
        isOpen={isMyGenerationsOpen}
        onClose={() => setIsMyGenerationsOpen(false)}
        email={
          limitModalEmail ||
          verifiedEmail ||
          session?.user?.email ||
          (typeof window !== "undefined"
            ? localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email") || ""
            : "")
        }
        onSelectGeneration={handleSelectGeneration}
        onUseDifferentEmail={handleUseDifferentEmail}
      />

      {/* Limit Reached Pop-up Modal */}
      <LimitReachedModal
        isOpen={isLimitReachedModalOpen}
        onClose={() => setIsLimitReachedModalOpen(false)}
        email={limitModalEmail || verifiedEmail}
        onUseDifferentEmail={handleUseDifferentEmail}
        onViewGenerations={() => setIsMyGenerationsOpen(true)}
      />
    </div>
  );
}
