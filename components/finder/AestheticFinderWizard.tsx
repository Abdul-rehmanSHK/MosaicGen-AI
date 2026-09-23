"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Compass,
  Layers,
  Download,
  Maximize2,
  X,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { EmailOtpModal } from "@/components/studio/EmailOtpModal";
import { LimitReachedModal } from "@/components/studio/LimitReachedModal";
import { InquiryModal } from "@/components/InquiryModal";

export interface OptionRecord {
  id: string;
  stepId: string;
  label: string;
  value: string;
  imageUrl?: string | null;
  colorHex?: string | null;
  order: number;
}

export interface StepRecord {
  id: string;
  stepNumber: number;
  key: string;
  title: string;
  highlightWord?: string | null;
  subtitle?: string | null;
  description: string;
  order: number;
  featuredProductIds?: string | null;
  options: OptionRecord[];
}

interface GenerationItem {
  id: string;
  resultImageUrl: string;
  prompt: string;
  placement: string;
  userEmail?: string | null;
  createdAt: string | Date;
  status?: string;
}

interface WizardProps {
  initialSteps: StepRecord[];
  availableProducts?: any[];
  availableGenerations?: GenerationItem[];
}

export function AestheticFinderWizard({
  initialSteps,
  availableProducts = [],
  availableGenerations = [],
}: WizardProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gold-400 font-serif">Loading Aesthetic Studio...</div>}>
      <AestheticFinderContent
        initialSteps={initialSteps}
        availableProducts={availableProducts}
        availableGenerations={availableGenerations}
      />
    </Suspense>
  );
}

function AestheticFinderContent({
  initialSteps,
  availableProducts = [],
  availableGenerations = [],
}: WizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query parameters
  const paramStyle = searchParams.get("style") || "";
  const paramShape = searchParams.get("shape") || "";
  const paramColor = searchParams.get("color") || "";
  const paramSpace = searchParams.get("space") || "";

  const [selectedStyle, setSelectedStyle] = useState<string>(paramStyle);
  const [selectedShape, setSelectedShape] = useState<string>(paramShape);
  const [selectedColor, setSelectedColor] = useState<string>(paramColor);
  const [selectedSpace, setSelectedSpace] = useState<string>(paramSpace);

  // Dynamic answers map supporting arbitrary steps added in CMS
  const [answers, setAnswers] = useState<Record<string, string>>({
    style: paramStyle,
    shape: paramShape,
    color: paramColor,
    space: paramSpace,
  });

  // Dynamic generations list for showcase
  const [generationsList, setGenerationsList] = useState<GenerationItem[]>(availableGenerations || []);

  // AI Generation in-place state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("Analyzing your architectural aesthetic & taste preferences...");
  const [generatedResult, setGeneratedResult] = useState<{
    id?: string;
    resultImageUrl: string;
    promptApplied: string;
    estimatedCost?: number;
    estimatedSqFt?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false);
  const [limitModalEmail, setLimitModalEmail] = useState("");
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-restore verification state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("zm_verified_email");
      const storedToken = localStorage.getItem("zm_verified_token");
      if (storedEmail && storedToken) {
        setIsVerified(true);
        setVerifiedEmail(storedEmail);
      }
    }
  }, []);

  // Determine result step index
  const resultStepIndex = initialSteps.findIndex((s) => s.key === "result");
  const maxStepIndex = resultStepIndex !== -1 ? resultStepIndex : initialSteps.length - 1;

  // Determine current active step (0 to maxStepIndex)
  const getInitialStep = () => {
    if (paramSpace && paramColor && paramShape && paramStyle) return maxStepIndex;
    if (paramColor && paramShape && paramStyle) return Math.min(3, maxStepIndex);
    if (paramShape && paramStyle) return Math.min(2, maxStepIndex);
    if (paramStyle) return Math.min(1, maxStepIndex);
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(getInitialStep());

  // Sync state with URL params
  useEffect(() => {
    const pStyle = searchParams.get("style") || "";
    const pShape = searchParams.get("shape") || "";
    const pColor = searchParams.get("color") || "";
    const pSpace = searchParams.get("space") || "";

    setSelectedStyle(pStyle);
    setSelectedShape(pShape);
    setSelectedColor(pColor);
    setSelectedSpace(pSpace);

    setAnswers((prev) => ({
      ...prev,
      style: pStyle,
      shape: pShape,
      color: pColor,
      space: pSpace,
    }));

    if (pSpace && pColor && pShape && pStyle) {
      setCurrentStepIndex(maxStepIndex);
    } else if (pColor && pShape && pStyle) {
      setCurrentStepIndex(Math.min(3, maxStepIndex));
    } else if (pShape && pStyle) {
      setCurrentStepIndex(Math.min(2, maxStepIndex));
    } else if (pStyle) {
      setCurrentStepIndex(Math.min(1, maxStepIndex));
    }
  }, [searchParams, maxStepIndex]);

  const updateUrl = (style: string, shape: string, color: string, space: string) => {
    const params = new URLSearchParams();
    if (style) params.set("style", style);
    if (shape) params.set("shape", shape);
    if (color) params.set("color", color);
    if (space) params.set("space", space);
    const queryString = params.toString();
    router.push(queryString ? `/finder?${queryString}` : "/finder", { scroll: false });
  };

  const currentStep = initialSteps[currentStepIndex] || initialSteps[0];
  const isResultStep = currentStepIndex === maxStepIndex;

  const handleSelectOption = (value: string) => {
    const stepObj = initialSteps[currentStepIndex];
    if (!stepObj) return;

    const newAnswers = { ...answers, [stepObj.key]: value };
    setAnswers(newAnswers);

    let newStyle = selectedStyle;
    let newShape = selectedShape;
    let newColor = selectedColor;
    let newSpace = selectedSpace;

    if (stepObj.key === "style") {
      newStyle = value;
      setSelectedStyle(value);
    } else if (stepObj.key === "shape") {
      newShape = value;
      setSelectedShape(value);
    } else if (stepObj.key === "color") {
      newColor = value;
      setSelectedColor(value);
    } else if (stepObj.key === "space") {
      newSpace = value;
      setSelectedSpace(value);
    }

    updateUrl(newStyle, newShape, newColor, newSpace);

    if (currentStepIndex < maxStepIndex) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    if (index <= currentStepIndex) {
      setCurrentStepIndex(index);
    } else {
      const canJump = initialSteps.slice(0, index).every((s) => answers[s.key] || s.key === "result");
      if (canJump) {
        setCurrentStepIndex(index);
      }
    }
  };

  const handleReset = () => {
    setSelectedStyle("");
    setSelectedShape("");
    setSelectedColor("");
    setSelectedSpace("");
    setAnswers({});
    setGeneratedResult(null);
    setError(null);
    setCurrentStepIndex(0);
    router.push("/finder");
  };

  // Helper to render title with italic highlight word
  const renderStyledTitle = (title: string, highlight?: string | null) => {
    if (!highlight || !title.includes(highlight)) {
      return title;
    }
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <em className="italic font-serif text-gold-400 font-normal">{highlight}</em>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  // Step names for stepper
  const STEP_NAMES = ["STYLE", "SHAPE", "COLOR", "SPACE", "RESULT"];
  const SCRIPT_NAMES = ["Style", "Shape", "Color", "Space", "Result"];

  // Mapping labels for Result Card
  const getSelectedLabel = (stepKey: string, value: string) => {
    const step = initialSteps.find((s) => s.key === stepKey);
    const option = step?.options.find((o) => o.value === value || o.label === value);
    return option?.label || value || "Not selected";
  };

  const styleLabel = getSelectedLabel("style", selectedStyle || answers["style"] || "");
  const shapeLabel = getSelectedLabel("shape", selectedShape || answers["shape"] || "");
  const colorLabel = getSelectedLabel("color", selectedColor || answers["color"] || "");
  const spaceLabel = getSelectedLabel("space", selectedSpace || answers["space"] || "");

  // Dynamic Prompt Construction from all answered steps
  const questionnaireSteps = initialSteps.filter((s) => s.key !== "result");
  const promptSegments: string[] = [];

  questionnaireSteps.forEach((s) => {
    const val = answers[s.key] || (s.key === "style" ? selectedStyle : s.key === "shape" ? selectedShape : s.key === "color" ? selectedColor : s.key === "space" ? selectedSpace : "");
    if (val) {
      const opt = s.options.find((o) => o.value === val || o.label === val);
      const label = opt?.label || val;
      if (s.key === "style") promptSegments.push(`${label} aesthetic`);
      else if (s.key === "shape") promptSegments.push(`${label} geometric composition`);
      else if (s.key === "color") promptSegments.push(`${label} color palette`);
      else if (s.key === "space") promptSegments.push(`designed specifically for luxury ${label} surface placement`);
      else promptSegments.push(`with ${s.title || s.key}: ${label}`);
    }
  });

  const generatedVisionPrompt = promptSegments.length > 0
    ? `Bespoke handcrafted architectural mosaic installation featuring ${promptSegments.join(", ")}, engineered with authentic Italian marble, Venetian smalti, and polished gold accents.`
    : `Bespoke handcrafted architectural mosaic installation in authentic Italian marble and Venetian smalti with polished gold accents.`;

  // Automatically record quiz result to database for admin analytics
  useEffect(() => {
    if (isResultStep && selectedStyle && selectedShape && selectedColor && selectedSpace) {
      fetch("/api/finder/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          shape: selectedShape,
          color: selectedColor,
          space: selectedSpace,
          generatedPrompt: generatedVisionPrompt,
          userEmail: verifiedEmail || null,
        }),
      }).catch((err) => console.error("Auto-recording quiz result failed:", err));
    }
  }, [isResultStep, selectedStyle, selectedShape, selectedColor, selectedSpace, verifiedEmail, generatedVisionPrompt]);

  // Execute AI Generation in-place on /finder
  const handleExecuteGeneration = async (emailOverride?: string) => {
    const emailToSend =
      emailOverride ||
      verifiedEmail ||
      (typeof window !== "undefined" ? localStorage.getItem("zm_verified_email") : null);

    if (!emailToSend) {
      setIsOtpModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStep("Analyzing your architectural aesthetic & taste preferences...");

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep(`Synthesizing ${styleLabel || "bespoke"} mosaic tesserae in Italian marble and Venetian smalti...`);
      }, 2400);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep(`Applying ${colorLabel || "custom"} palette, 24k gold leaf inlays, and surface perspective...`);
      }, 5200);

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("zm_verified_token")
            ? { "x-verified-token": localStorage.getItem("zm_verified_token")! }
            : {}),
        },
        body: JSON.stringify({
          prompt: generatedVisionPrompt,
          placement: spaceLabel || "Floor Medallion",
          finish: "Honed with Polished Gold Accents",
          groutColor: "Charcoal Platinum",
          email: emailToSend,
          verifiedToken:
            typeof window !== "undefined"
              ? localStorage.getItem("zm_verified_token") || undefined
              : undefined,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 403 &&
          (data.error === "LIMIT_REACHED" || (data.message && data.message.toLowerCase().includes("limit")))
        ) {
          setIsGenerating(false);
          setError(null);
          setLimitModalEmail(emailToSend || data.email || "");
          setIsLimitReachedModalOpen(true);
          return;
        }
        throw new Error(data.message || data.error || "Generation request failed");
      }

      const newGenResult = {
        id: data.generationId || data.id,
        resultImageUrl: data.resultImageUrl,
        promptApplied: data.promptApplied || generatedVisionPrompt,
        estimatedCost: data.estimatedMaterialCost,
        estimatedSqFt: data.estimatedSqFt,
      };

      setGeneratedResult(newGenResult);

      // Prepend to generations showcase so the new design appears below immediately
      if (data.resultImageUrl) {
        setGenerationsList((prev) => [
          {
            id: data.generationId || `new-${Date.now()}`,
            resultImageUrl: data.resultImageUrl,
            prompt: data.promptApplied || generatedVisionPrompt,
            placement: spaceLabel || "Floor Medallion",
            userEmail: emailToSend,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (!isVerified) {
      setIsOtpModalOpen(true);
      return;
    }
    handleExecuteGeneration(verifiedEmail);
  };

  const handleOtpVerified = (email: string) => {
    setIsVerified(true);
    setVerifiedEmail(email);
    setIsOtpModalOpen(false);
    handleExecuteGeneration(email);
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 py-6 px-4 sm:px-6">
      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-widest">
          <span>STEP 0{currentStepIndex + 1} OF 0{initialSteps.length}</span>
          <span className="font-serif italic capitalize text-base sm:text-lg text-gold-400/90">
            {SCRIPT_NAMES[currentStepIndex] || currentStep?.title || "Step"}
          </span>
        </div>

        {/* Stepper Dots & Track */}
        <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
          {/* Background Track Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-800 -z-0" />
          {/* Active Fill Line */}
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-gold-500 to-amber-500 transition-all duration-500 -z-0"
            style={{ width: `calc(${(currentStepIndex / (initialSteps.length - 1)) * 100}% - 2.5rem)` }}
          />

          {initialSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id || idx}
                onClick={() => handleJumpToStep(idx)}
                className="relative z-10 flex flex-col items-center gap-2.5 cursor-pointer group"
              >
                {/* Stepper Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                    isCompleted
                      ? "bg-obsidian-950 border-2 border-gold-500 text-gold-400 shadow-md shadow-gold-500/15"
                      : isCurrent
                      ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold border-2 border-gold-300 ring-4 ring-gold-500/20 shadow-lg shadow-gold-500/30 scale-110"
                      : "bg-obsidian-950 border border-neutral-700 text-neutral-500 group-hover:border-neutral-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-gold-400 stroke-[3]" />
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[11px] font-mono tracking-wider transition-colors uppercase ${
                    isCurrent
                      ? "text-gold-400 font-bold"
                      : isCompleted
                      ? "text-neutral-300"
                      : "text-neutral-600 group-hover:text-neutral-400"
                  }`}
                >
                  {STEP_NAMES[idx] || step.key}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= STEP HEADING & DESCRIPTIONS ================= */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-gold-400/90 font-medium">
          {currentStep?.subtitle || `STEP 0${currentStepIndex + 1} • ${STEP_NAMES[currentStepIndex] || currentStep?.key}`}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white tracking-tight">
          {renderStyledTitle(currentStep?.title || "Choose Your Aesthetic", currentStep?.highlightWord)}
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mt-1 leading-relaxed">
          {currentStep?.description}
        </p>
      </div>

      {/* ================= STEP CONTENT ================= */}
      <div className="w-full">
        {/* Steps 1-4: INTERACTIVE QUESTIONNAIRE */}
        {!isResultStep && (
          <div
            className={`grid gap-5 ${
              currentStep?.key === "color"
                ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-7"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
            }`}
          >
            {currentStep?.options.map((opt) => {
              const currentVal = answers[currentStep.key] || "";
              const isSelected = currentVal === opt.value;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 shadow-xl ${
                    isSelected
                      ? "border-gold-400 ring-2 ring-gold-500/50 scale-[1.02] shadow-[0_0_25px_rgba(218,165,32,0.25)]"
                      : "border-neutral-800 bg-obsidian-900 hover:border-gold-500/50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(218,165,32,0.15)]"
                  }`}
                >
                  {opt.imageUrl ? (
                    <img
                      src={opt.imageUrl}
                      alt={opt.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : opt.colorHex ? (
                    <div
                      className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundColor: opt.colorHex }}
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex items-center justify-between">
                    <span className="font-serif font-medium text-sm sm:text-base text-white group-hover:text-gold-300 transition-colors">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-obsidian-950 shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 5: RESULT */}
        {isResultStep && (
          <div className="w-full flex flex-col gap-10">
            {/* 1. If currently generating, show the luxurious neural synthesis progress card */}
            {isGenerating ? (
              <div className="relative w-full p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#1c1507] via-[#2d1e08] to-[#120d04] border-2 border-gold-500/60 shadow-[0_0_70px_rgba(218,165,32,0.28)] backdrop-blur-2xl flex flex-col items-center justify-center gap-6 overflow-hidden min-h-[380px] text-center">
                <div className="absolute w-72 h-72 bg-gold-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full bg-obsidian-950/90 border-2 border-gold-400 flex items-center justify-center shadow-xl shadow-gold-500/20">
                    <div className="absolute inset-0 rounded-full border-2 border-gold-400/40 animate-ping pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-gold-400 animate-spin" style={{ animationDuration: "5s" }} />
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-lg">
                    <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-400 font-bold">
                      NEURAL MOSAIC SYNTHESIS IN PROGRESS
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-white font-light">
                      Generating Your Bespoke Mosaic
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 font-light mt-1">
                      {generationStep}
                    </p>
                  </div>

                  {/* Selections Pill Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-obsidian-950/90 border border-gold-500/30 text-gold-300 text-xs font-mono">
                      Style: {styleLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-obsidian-950/90 border border-gold-500/30 text-gold-300 text-xs font-mono">
                      Shape: {shapeLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-obsidian-950/90 border border-gold-500/30 text-gold-300 text-xs font-mono">
                      Color: {colorLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-obsidian-950/90 border border-gold-500/30 text-gold-300 text-xs font-mono">
                      Space: {spaceLabel}
                    </span>
                  </div>

                  <div className="w-64 h-1.5 bg-obsidian-950 rounded-full overflow-hidden border border-gold-500/30 mt-2">
                    <div className="w-full h-full bg-gradient-to-r from-gold-500 via-amber-300 to-gold-500 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : generatedResult ? (
              /* 2. If generatedResult is present: Show the Generated Mosaic Masterpiece! */
              <div className="relative w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1c1507] via-[#2d1e08] to-[#120d04] border-2 border-gold-500/60 shadow-[0_0_70px_rgba(218,165,32,0.28)] backdrop-blur-2xl flex flex-col gap-8 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-500/25 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-[90px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" /> YOUR BESPOKE AI MOSAIC RESULT
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-white">
                      Architectural Mosaic Masterpiece Generated
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300">
                      Rendered exclusively for your {styleLabel} aesthetic and {spaceLabel} surface geometry.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Synthesis Complete
                    </span>
                  </div>
                </div>

                {/* Main Generated Image & Info Split */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column (7 cols): Large Generated Mosaic Display */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div
                      onClick={() => setIsLightboxOpen(true)}
                      className="group relative w-full aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-obsidian-950 border-2 border-gold-500/50 shadow-2xl cursor-zoom-in transition-all hover:border-gold-400 hover:shadow-gold-500/20"
                    >
                      <img
                        src={generatedResult.resultImageUrl}
                        alt={generatedResult.promptApplied}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-xs font-serif text-white flex items-center gap-1.5 bg-obsidian-950/80 px-3 py-1.5 rounded-xl border border-gold-500/30">
                          <Maximize2 className="w-3.5 h-3.5 text-gold-400" /> Click to view full resolution
                        </span>
                        <span className="text-[10px] font-mono text-gold-300 bg-obsidian-950/80 px-2.5 py-1 rounded-lg border border-gold-500/30">
                          Authentic Tesserae
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-obsidian-950/85 backdrop-blur-md border border-gold-500/40 text-gold-300 font-mono text-xs font-bold uppercase tracking-wider">
                        {spaceLabel || "Bespoke Mosaic"}
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 text-center font-mono flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-gold-400" /> High-precision AI mosaic tesserae rendered with authentic marble & gold leaf
                    </span>
                  </div>

                  {/* Right Column (5 cols): Taste Attributes, Prompt & Actions */}
                  <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
                    {/* Taste Attributes */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-obsidian-950/85 border border-gold-500/30 shadow-inner">
                      {questionnaireSteps.map((step, idx) => {
                        const val = answers[step.key] || (idx === 0 ? selectedStyle : idx === 1 ? selectedShape : idx === 2 ? selectedColor : idx === 3 ? selectedSpace : "");
                        const label = getSelectedLabel(step.key, val);
                        return (
                          <div key={step.id || step.key} className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-gold-400/80">
                              {step.title || step.key}
                            </span>
                            <span className="text-xs font-serif font-bold text-white capitalize truncate">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Applied Prompt */}
                    <div className="p-4 rounded-xl bg-obsidian-950/70 border border-neutral-800 flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-semibold">
                        Applied Artisan Vision Prompt
                      </span>
                      <p className="text-xs text-neutral-300 font-serif italic leading-relaxed">
                        &ldquo;{generatedResult.promptApplied}&rdquo;
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <Link
                        href={`/?mode=scratch&prompt=${encodeURIComponent(
                          generatedResult.promptApplied
                        )}&placement=${encodeURIComponent(spaceLabel || "Floor Medallion")}`}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/25 active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 fill-obsidian-950" />
                        Customize & Inpaint in Studio
                      </Link>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(generatedResult.resultImageUrl, `zakiah-mosaic-${(styleLabel || "custom").toLowerCase()}-${(spaceLabel || "design").toLowerCase()}.jpg`)}
                          className="py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-neutral-700 hover:border-gold-500/40 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-gold-400" />
                          Download
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsInquiryModalOpen(true)}
                          className="py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-neutral-700 hover:border-gold-500/40 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                          Quote Inquiry
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleExecuteGeneration()}
                          disabled={isGenerating}
                          className="flex-1 py-2 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-800 text-gold-400 hover:text-gold-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 transition-all border border-gold-500/30 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Generate Another Variation
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="py-2 px-3 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-800 text-neutral-400 hover:text-white text-[11px] font-mono transition-all border border-neutral-800 cursor-pointer"
                        >
                          Start Over
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 3. Initial Result Card before Generation */
              <div className="relative w-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1c1507] via-[#2d1e08] to-[#120d04] border-2 border-gold-500/60 shadow-[0_0_70px_rgba(218,165,32,0.28)] backdrop-blur-2xl flex flex-col gap-8 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-500/25 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-[90px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> YOUR AESTHETIC RESULT
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-white">
                    Based on your answers, you have an <em className="italic text-gold-400 font-normal">exquisite architectural sense</em>.
                  </h2>
                </div>

                {/* Taste Attributes Grid (Dynamically includes all questionnaire steps) */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-obsidian-950/80 border border-gold-500/25 shadow-inner">
                  {questionnaireSteps.map((step, idx) => {
                    const val = answers[step.key] || (idx === 0 ? selectedStyle : idx === 1 ? selectedShape : idx === 2 ? selectedColor : idx === 3 ? selectedSpace : "");
                    const label = getSelectedLabel(step.key, val);
                    return (
                      <div key={step.id || step.key} className="flex flex-col gap-1 border-r last:border-r-0 border-neutral-800/80 pr-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400/80">
                          {step.title || step.key}
                        </span>
                        <span className="text-sm font-serif font-bold text-white capitalize">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="relative z-10 text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-3xl">
                  Press the button below to generate a one-of-a-kind mosaic design crafted specifically from your {styleLabel} style, {shapeLabel} composition, and {colorLabel} palette for {spaceLabel}.
                </p>

                {error && (
                  <div className="relative z-10 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative z-10 flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-serif font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-obsidian-950" />
                    Generate my mosaic
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-3.5 rounded-xl bg-obsidian-800/90 hover:bg-obsidian-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all border border-neutral-700 hover:border-gold-500/30 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Start over
                  </button>
                </div>
              </div>
            )}

            {/* ================= AI GENERATED MOSAIC RESULTS AT BOTTOM ================= */}
            {(() => {
              let featuredIds: string[] = [];
              try {
                if (currentStep?.featuredProductIds) {
                  featuredIds = JSON.parse(currentStep.featuredProductIds);
                }
              } catch {
                featuredIds = [];
              }

              // Check if featured IDs correspond to studio generations
              let displayGenerations: GenerationItem[] = [];
              if (generationsList && generationsList.length > 0) {
                if (featuredIds.length > 0) {
                  const curated = featuredIds
                    .map((id) => generationsList.find((g) => g.id === id))
                    .filter((g): g is GenerationItem => Boolean(g));
                  if (curated.length > 0) {
                    displayGenerations = curated;
                  }
                }
                if (displayGenerations.length === 0) {
                  displayGenerations = generationsList.slice(0, 4);
                }
              }

              // If we have AI studio generations to showcase
              if (displayGenerations.length > 0) {
                return (
                  <div className="flex flex-col gap-6 pt-4 border-t border-gold-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold block">
                          STUDIO GENERATED INSPIRATIONS
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                          One-of-a-Kind Mosaics Generated For Your Taste
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Bespoke neural mosaic renders matching your {styleLabel} aesthetic
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {displayGenerations.map((gen) => (
                        <div
                          key={gen.id}
                          className="group rounded-2xl bg-obsidian-900/80 border border-gold-500/20 hover:border-gold-500/50 overflow-hidden shadow-xl transition-all flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] w-full bg-obsidian-950 overflow-hidden">
                            <img
                              src={gen.resultImageUrl}
                              alt={gen.prompt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-obsidian-950/85 backdrop-blur-md border border-gold-500/30 text-gold-300 font-mono font-bold text-[10px] tracking-wider uppercase">
                              {gen.placement || "Bespoke"}
                            </div>
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 backdrop-blur-md border border-gold-500/40 text-gold-300 font-mono text-[9px] flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> AI Render
                            </div>
                          </div>

                          <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-gold-400/90 uppercase tracking-wider block">
                                Handcrafted AI Synthesis
                              </span>
                              <h4 className="font-serif font-bold text-white text-sm line-clamp-1 mt-0.5">
                                {gen.placement} Mosaic Concept
                              </h4>
                              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed font-light">
                                {gen.prompt}
                              </p>
                            </div>

                            <Link
                              href={`/?mode=scratch&prompt=${encodeURIComponent(
                                gen.prompt
                              )}&placement=${encodeURIComponent(gen.placement || spaceLabel)}`}
                              className="w-full py-2 rounded-xl bg-obsidian-800 hover:bg-gold-500 text-neutral-200 hover:text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700 hover:border-gold-500 shadow-md group-hover:shadow-gold-500/20 active:scale-[0.98]"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Use as Design Reference
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Fallback to catalog products if no studio generations exist yet
              let resultProducts = availableProducts;
              if (featuredIds.length > 0) {
                const curated = featuredIds
                  .map((id) => availableProducts.find((p) => p.id === id))
                  .filter(Boolean);
                if (curated.length > 0) resultProducts = curated;
              }

              const displayProducts = resultProducts.slice(0, 4);
              if (displayProducts.length === 0) return null;

              return (
                <div className="flex flex-col gap-6 pt-4 border-t border-gold-500/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold block">
                        CURATED MOSAIC REFERENCES
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                        Recommended Pieces For Your Aesthetic
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Handcrafted Italian Tesserae matching your {styleLabel} style
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {displayProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="group rounded-2xl bg-obsidian-900/80 border border-gold-500/20 hover:border-gold-500/50 overflow-hidden shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] w-full bg-obsidian-950 overflow-hidden">
                          <Image
                            src={prod.sampleImageUrl}
                            alt={prod.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 font-serif font-bold text-[10px]">
                            ${prod.pricePerSqFt}/sq.ft
                          </div>
                        </div>

                        <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-gold-400/90 uppercase tracking-wider block">
                              {prod.category}
                            </span>
                            <h4 className="font-serif font-bold text-white text-sm line-clamp-1 mt-0.5">
                              {prod.title}
                            </h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>

                          <Link
                            href={`/?mode=scratch&product=${prod.id}&prompt=${encodeURIComponent(
                              generatedVisionPrompt
                            )}&placement=${encodeURIComponent(spaceLabel)}`}
                            className="w-full py-2 rounded-xl bg-obsidian-800 hover:bg-gold-500 text-neutral-200 hover:text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700 hover:border-gold-500"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Use as Design Reference
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && generatedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/95 backdrop-blur-xl animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-obsidian-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={generatedResult.resultImageUrl}
              alt={generatedResult.promptApplied}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border-2 border-gold-500/40 shadow-2xl"
            />
            <div className="flex items-center justify-between w-full px-2 text-xs text-neutral-300 flex-wrap gap-2">
              <span className="font-serif italic truncate max-w-lg">&ldquo;{generatedResult.promptApplied}&rdquo;</span>
              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    generatedResult.resultImageUrl,
                    `zakiah-mosaic-${(styleLabel || "custom").toLowerCase()}-${(spaceLabel || "design").toLowerCase()}.jpg`
                  )
                }
                className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Image
              </button>
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

      {/* Quota Limit Reached Modal */}
      <LimitReachedModal
        isOpen={isLimitReachedModalOpen}
        onClose={() => setIsLimitReachedModalOpen(false)}
        email={limitModalEmail}
        onUseDifferentEmail={() => {
          setIsLimitReachedModalOpen(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("zm_verified_token");
            localStorage.removeItem("zm_verified_email");
          }
          setIsVerified(false);
          setVerifiedEmail("");
          setIsOtpModalOpen(true);
        }}
        onViewGenerations={() => {
          setIsLimitReachedModalOpen(false);
          router.push("/");
        }}
      />

      {/* Quote / Material Sample Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        initialData={
          generatedResult
            ? {
                generationId: generatedResult.id,
                resultImageUrl: generatedResult.resultImageUrl,
                prompt: generatedResult.promptApplied,
                placement: spaceLabel || "Floor Medallion",
                estimatedCost: generatedResult.estimatedCost,
              }
            : undefined
        }
      />
    </div>
  );
}
