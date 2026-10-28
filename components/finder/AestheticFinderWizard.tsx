"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  Mail,
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
    <Suspense fallback={<div className="p-12 text-center text-stone-700 font-serif">Loading Aesthetic Studio...</div>}>
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
  const hasAutoOpenedOtpModalRef = useRef(false);

  // Auto-restore verification state from localStorage on mount & listen to changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email");
      const storedToken = localStorage.getItem("zm_verified_token") || localStorage.getItem("mec_verified_token");
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

  // When arriving on Step 5 (Result), automatically trigger email verification if not yet verified
  useEffect(() => {
    if (isResultStep && !generatedResult && !isGenerating) {
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("zm_verified_email") : null;
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("zm_verified_token") : null;
      const isAlreadyVerified = isVerified || Boolean(storedEmail && storedToken);

      if (!isAlreadyVerified && !hasAutoOpenedOtpModalRef.current) {
        hasAutoOpenedOtpModalRef.current = true;
        setIsOtpModalOpen(true);
      }
    }
  }, [isResultStep, isVerified, generatedResult, isGenerating]);

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
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex === maxStepIndex) {
        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("zm_verified_email") : null;
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("zm_verified_token") : null;
        const isAlreadyVerified = isVerified || Boolean(storedEmail && storedToken);
        if (!isAlreadyVerified) {
          hasAutoOpenedOtpModalRef.current = true;
          setIsOtpModalOpen(true);
        }
      }
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
        <em className="italic font-serif text-stone-700 font-normal">{highlight}</em>
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
      hasAutoOpenedOtpModalRef.current = true;
      setIsOtpModalOpen(true);
      return;
    }
    handleExecuteGeneration(verifiedEmail);
  };

  const handleOtpVerified = (email: string) => {
    setIsVerified(true);
    setVerifiedEmail(email);
    setIsOtpModalOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("zm_verified_email_updated"));
      window.dispatchEvent(new Event("mec_verified_email_updated"));
    }
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
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 sm:gap-10 py-6 px-4 sm:px-6 text-stone-900">
      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-stone-500">
            Step{" "}
            <span className="text-stone-900 font-semibold tabular-nums">
              0{currentStepIndex + 1}
            </span>{" "}
            of 0{initialSteps.length}
          </p>
          <p className="font-serif text-sm sm:text-base font-light italic text-stone-800">
            {SCRIPT_NAMES[currentStepIndex] || currentStep?.title || "Step"}
          </p>
        </div>

        {/* Stepper Dots & Track */}
        <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
          {/* Background Track Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px bg-stone-200 -z-0" />
          {/* Active Fill Line */}
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-px bg-stone-900 transition-all duration-300 ease-out -z-0"
            style={{ width: `calc(${(currentStepIndex / (initialSteps.length - 1)) * 100}% - 2.5rem)` }}
          />

          {initialSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id || idx}
                onClick={() => handleJumpToStep(idx)}
                className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group"
              >
                {/* Stepper Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                    isCompleted
                      ? "bg-stone-900 border-2 border-stone-900 text-white shadow-xs"
                      : isCurrent
                      ? "bg-white text-stone-900 font-bold border-2 border-stone-900 ring-4 ring-stone-900/10 shadow-md scale-105"
                      : "bg-white border border-stone-300 text-stone-400 group-hover:border-stone-500 group-hover:text-stone-700 shadow-2xs"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[10px] font-mono tracking-[0.22em] transition-colors uppercase ${
                    isCurrent
                      ? "text-stone-900 font-bold"
                      : isCompleted
                      ? "text-stone-700 font-medium"
                      : "text-stone-400 group-hover:text-stone-600"
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
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-stone-500 font-semibold">
          {currentStep?.subtitle || `STEP 0${currentStepIndex + 1} • ${STEP_NAMES[currentStepIndex] || currentStep?.key}`}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-stone-900 tracking-tight">
          {renderStyledTitle(currentStep?.title || "Choose Your Aesthetic", currentStep?.highlightWord)}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-0.5 leading-relaxed">
          {currentStep?.description}
        </p>
      </div>

      {/* ================= STEP CONTENT ================= */}
      <div className="w-full">
        {/* Steps 1-4: INTERACTIVE QUESTIONNAIRE */}
        {!isResultStep && (
          <div
            className={`grid gap-4 sm:gap-5 ${
              currentStep?.key === "color"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
                : currentStep?.options?.length === 5
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            }`}
          >
            {currentStep?.options.map((opt) => {
              const currentVal = answers[currentStep.key] || "";
              const isSelected = currentVal === opt.value;
              const isColor = currentStep?.key === "color";
              const isNoPreference = opt.value === "any" || opt.value === "no-preference";

              // 1. Color Swatch Cards: clean white cards with centered circular swatch + label below
              if (isColor) {
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.value)}
                    className={`group relative rounded-2xl p-5 flex flex-col items-center justify-center gap-3.5 aspect-[4/5] cursor-pointer transition-all duration-300 shadow-2xs ${
                      isSelected
                        ? "border-2 border-stone-900 ring-4 ring-stone-900/10 bg-white scale-[1.02] shadow-md"
                        : "border border-stone-200/90 bg-white hover:border-stone-400 hover:scale-[1.01] hover:shadow-xs"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full border border-stone-200/60 shadow-inner transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: opt.colorHex || "#18181B",
                      }}
                    />
                    <span className="text-xs font-sans font-medium text-stone-800 text-center tracking-tight leading-snug">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              }

              // 2. Shape Step: "No preference" card without image
              if (isNoPreference && !opt.imageUrl) {
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.value)}
                    className={`group relative aspect-[3/4] rounded-2xl p-5 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-2xs ${
                      isSelected
                        ? "border-2 border-stone-900 ring-4 ring-stone-900/10 bg-white scale-[1.02] shadow-md"
                        : "border border-stone-200/90 bg-white hover:border-stone-400 hover:scale-[1.01] hover:shadow-xs"
                    }`}
                  >
                    <span className="font-serif font-medium text-sm sm:text-base text-stone-900 text-center">
                      No preference
                    </span>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              }

              // 3. Image Cards (Styles, Shapes, Spaces)
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 shadow-2xs ${
                    isSelected
                      ? "border-2 border-stone-900 ring-4 ring-stone-900/10 scale-[1.02] shadow-md"
                      : "border-stone-200/90 bg-white hover:border-stone-400 hover:scale-[1.01] hover:shadow-xs"
                  }`}
                >
                  {opt.imageUrl ? (
                    <img
                      src={opt.imageUrl}
                      alt={opt.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs">
                      {opt.label}
                    </div>
                  )}

                  {/* Dark gradient for crisp text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-95 group-hover:opacity-90 transition-opacity" />

                  {/* Bottom label & selection checkmark */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 z-10 flex items-center justify-between gap-1.5">
                    <span className="font-serif font-medium text-xs sm:text-sm text-white drop-shadow-sm leading-snug">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-md shrink-0">
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
              <div className="relative w-full p-8 sm:p-14 rounded-3xl bg-white border border-stone-200/90 shadow-xl flex flex-col items-center justify-center gap-6 overflow-hidden min-h-[380px] text-center animate-fadeIn text-stone-900">
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full bg-stone-100 border-2 border-stone-800 flex items-center justify-center shadow-md">
                    <Loader2 className="w-8 h-8 text-stone-800 animate-spin" />
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-lg">
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-stone-500 font-bold">
                      ARTISAN MOSAIC SYNTHESIS IN PROGRESS
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal italic">
                      Generating Your Bespoke Mosaic
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 font-light mt-1">
                      {generationStep}
                    </p>
                  </div>

                  {/* Selections Pill Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                      Style: {styleLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                      Shape: {shapeLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                      Color: {colorLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                      Space: {spaceLabel}
                    </span>
                  </div>

                  <div className="w-64 h-1.5 bg-stone-200 rounded-full overflow-hidden mt-3">
                    <div className="w-full h-full bg-stone-900 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : generatedResult ? (
              /* 2. If generatedResult is present: Show the Generated Mosaic Masterpiece! */
              <div className="relative w-full p-6 sm:p-10 rounded-3xl bg-white border border-stone-200/90 shadow-xl flex flex-col gap-8 overflow-hidden text-stone-900 animate-fadeIn">
                {/* Header */}
                <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-100 pb-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-stone-500 font-bold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-stone-600" /> YOUR BESPOKE AI MOSAIC RESULT
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal italic">
                      Architectural Mosaic Masterpiece Generated
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500">
                      Rendered exclusively for your {styleLabel} aesthetic and {spaceLabel} surface geometry.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs flex items-center gap-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" /> Synthesis Complete
                    </span>
                  </div>
                </div>

                {/* Main Generated Image & Info Split */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column (7 cols): Large Generated Mosaic Display */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div
                      onClick={() => setIsLightboxOpen(true)}
                      className="group relative w-full aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md cursor-zoom-in transition-all hover:border-stone-400 hover:shadow-xl"
                    >
                      <img
                        src={generatedResult.resultImageUrl}
                        alt={generatedResult.promptApplied}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-xs font-serif text-white flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-white/20">
                          <Maximize2 className="w-3.5 h-3.5" /> Click to view full resolution
                        </span>
                        <span className="text-[10px] font-mono text-white bg-stone-900/80 px-2.5 py-1 rounded-lg border border-white/20">
                          Authentic Tesserae
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 text-stone-800 font-mono text-xs font-semibold uppercase tracking-wider shadow-2xs">
                        {spaceLabel || "Bespoke Mosaic"}
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-500 text-center font-mono flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-stone-500" /> High-precision AI mosaic tesserae rendered with authentic marble & gold leaf
                    </span>
                  </div>

                  {/* Right Column (5 cols): Taste Attributes, Prompt & Actions */}
                  <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
                    {/* Taste Attributes */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs">
                      {questionnaireSteps.map((step, idx) => {
                        const val = answers[step.key] || (idx === 0 ? selectedStyle : idx === 1 ? selectedShape : idx === 2 ? selectedColor : idx === 3 ? selectedSpace : "");
                        const label = getSelectedLabel(step.key, val);
                        return (
                          <div key={step.id || step.key} className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold">
                              {step.title || step.key}
                            </span>
                            <span className="text-xs font-serif font-bold text-stone-900 capitalize truncate">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Applied Prompt */}
                    <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200 flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                        Applied Artisan Vision Prompt
                      </span>
                      <p className="text-xs text-stone-700 font-serif italic leading-relaxed">
                        &ldquo;{generatedResult.promptApplied}&rdquo;
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <Link
                        href={`/?mode=scratch&prompt=${encodeURIComponent(
                          generatedResult.promptApplied
                        )}&placement=${encodeURIComponent(spaceLabel || "Floor Medallion")}`}
                        className="w-full py-3 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-serif font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        Customize & Inpaint in Studio
                      </Link>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(generatedResult.resultImageUrl, `zakiah-mosaic-${(styleLabel || "custom").toLowerCase()}-${(spaceLabel || "design").toLowerCase()}.jpg`)}
                          className="py-2.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all border border-stone-200 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          Download
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsInquiryModalOpen(true)}
                          className="py-2.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all border border-stone-200 cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                          Quote Inquiry
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleExecuteGeneration()}
                          disabled={isGenerating}
                          className="flex-1 py-2 rounded-full bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all border border-stone-300 cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className="w-3 h-3 text-stone-500" />
                          Generate Another Variation
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="py-2 px-4 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 text-[11px] transition-all border border-stone-200 cursor-pointer shadow-2xs"
                        >
                          Start Over
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 3. Initial Result Card before Generation (Matches exact reference layout) */
              <div className="relative w-full p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-6 text-stone-900 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-stone-500 font-bold">
                    YOUR TASTE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif text-stone-900 font-normal">
                    Based on your answers, you have an{" "}
                    <em className="italic font-serif font-normal text-stone-800">
                      exquisite aesthetic sense
                    </em>
                    .
                  </h2>
                </div>

                {/* 4 Taste Columns matching exact reference */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 pb-2">
                  <div className="border-l-2 border-stone-300 pl-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-stone-400 block font-mono">
                      COLLECTION
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900 block capitalize">
                      {styleLabel || "—"}
                    </span>
                  </div>

                  <div className="border-l-2 border-stone-300 pl-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-stone-400 block font-mono">
                      SHAPE
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900 block capitalize">
                      {shapeLabel === "any" || shapeLabel === "no-preference" ? "No preference" : shapeLabel || "—"}
                    </span>
                  </div>

                  <div className="border-l-2 border-stone-300 pl-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-stone-400 block font-mono">
                      COLOUR
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900 block capitalize">
                      {colorLabel || "—"}
                    </span>
                  </div>

                  <div className="border-l-2 border-stone-300 pl-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-stone-400 block font-mono">
                      PLACEMENT
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900 block capitalize">
                      {spaceLabel || "—"}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                  Press the button below to see a one-of-a-kind design that reflects your taste. Customisation can be made to any chosen mosaic, and we&apos;re always available for a free consultation.
                </p>

                {/* Email Verification Flow Banner */}
                {!isVerified ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-200/80 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-stone-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-stone-900">Email Verification Required</span>
                        <span className="text-[11px] text-stone-500">
                          Verify your email to synthesize and view your bespoke AI mosaic concept.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-medium text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5 text-white" />
                      Verify Email to Generate
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-emerald-900">Email Verified: {verifiedEmail}</span>
                        <span className="text-[11px] text-emerald-700">Ready to synthesize your architectural concept.</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    {isVerified ? "Generate my mosaic" : "Verify Email & Generate"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 text-stone-500 hover:text-stone-900 text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                    Start over
                  </button>
                </div>
              </div>
            )}

            {/* ================= CATALOG MOSAIC RECOMMENDATIONS & STUDIO RESULTS ================= */}
            {(() => {
              // 1. Filter matching products from active catalog
              const selStyle = (selectedStyle || answers["style"] || "").toLowerCase();
              const selSpace = (selectedSpace || answers["space"] || "").toLowerCase();

              const matchingProducts = availableProducts.filter((p) => {
                let specs: any = {};
                try {
                  specs = typeof p.specs === "string" ? JSON.parse(p.specs || "{}") : p.specs || {};
                } catch {
                  specs = {};
                }
                if (specs.showOnFinder === false) return false;

                const pStyle = (specs.style || p.category || "").toLowerCase();
                const pSpace = (specs.space || "").toLowerCase();

                if (selStyle && (pStyle.includes(selStyle) || selStyle.includes(pStyle))) return true;
                if (selSpace && (pSpace.includes(selSpace) || selSpace.includes(pSpace))) return true;
                return false;
              });

              const displayProducts = (matchingProducts.length > 0 ? matchingProducts : availableProducts).slice(0, 4);

              // 2. Studio generations
              const displayGenerations = (generationsList || []).slice(0, 4);

              return (
                <div className="flex flex-col gap-10 pt-4 border-t border-stone-200">
                  {/* Matching Catalog Pieces */}
                  {displayProducts.length > 0 && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone-500 font-semibold block">
                            CURATED CATALOG PIECES
                          </span>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                            Recommended Pieces For Your Aesthetic
                          </h3>
                        </div>
                        <p className="text-xs text-stone-500">
                          Handcrafted Italian Tesserae matching your {styleLabel} aesthetic
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {displayProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="group rounded-2xl bg-white border border-stone-200 hover:border-stone-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                              <Image
                                src={prod.sampleImageUrl}
                                alt={prod.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 font-serif font-bold text-[10px] shadow-2xs">
                                ${prod.pricePerSqFt}/sq.ft
                              </div>
                            </div>

                            <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                              <div>
                                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-medium">
                                  {prod.category}
                                </span>
                                <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 mt-0.5">
                                  {prod.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                                  {prod.description}
                                </p>
                              </div>

                              <Link
                                href={`/?mode=scratch&product=${prod.id}&prompt=${encodeURIComponent(
                                  generatedVisionPrompt
                                )}&placement=${encodeURIComponent(spaceLabel)}`}
                                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Use as Design Reference
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Generations Showcase */}
                  {displayGenerations.length > 0 && (
                    <div className="flex flex-col gap-5 pt-4 border-t border-stone-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone-500 font-semibold block">
                            STUDIO AI INSPIRATIONS
                          </span>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                            Neural Mosaics Generated For Similar Tastes
                          </h3>
                        </div>
                        <p className="text-xs text-stone-500">
                          Bespoke neural mosaic concepts synthesized in our studio
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {displayGenerations.map((gen) => (
                          <div
                            key={gen.id}
                            className="group rounded-2xl bg-white border border-stone-200 hover:border-stone-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                              <img
                                src={gen.resultImageUrl}
                                alt={gen.prompt}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 font-mono font-bold text-[10px] tracking-wider uppercase shadow-2xs">
                                {gen.placement || "Bespoke"}
                              </div>
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono text-[9px] flex items-center gap-1 border border-stone-200">
                                <Sparkles className="w-2.5 h-2.5" /> AI Render
                              </div>
                            </div>

                            <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                              <div>
                                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-medium">
                                  Handcrafted AI Synthesis
                                </span>
                                <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 mt-0.5">
                                  {gen.placement} Mosaic Concept
                                </h4>
                                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed font-light">
                                  {gen.prompt}
                                </p>
                              </div>

                              <Link
                                href={`/?mode=scratch&prompt=${encodeURIComponent(
                                  gen.prompt
                                )}&placement=${encodeURIComponent(gen.placement || spaceLabel)}`}
                                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-stone-200"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Use as Design Reference
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && generatedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-stone-900 border border-stone-700 text-stone-200 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={generatedResult.resultImageUrl}
              alt={generatedResult.promptApplied}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border-2 border-stone-700 shadow-2xl"
            />
            <div className="flex items-center justify-between w-full px-2 text-xs text-stone-300 flex-wrap gap-2">
              <span className="font-serif italic truncate max-w-lg">&ldquo;{generatedResult.promptApplied}&rdquo;</span>
              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    generatedResult.resultImageUrl,
                    `zakiah-mosaic-${(styleLabel || "custom").toLowerCase()}-${(spaceLabel || "design").toLowerCase()}.jpg`
                  )
                }
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
