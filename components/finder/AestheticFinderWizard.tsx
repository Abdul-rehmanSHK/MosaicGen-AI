"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Sparkles, RefreshCw, ArrowRight, Compass, Layers } from "lucide-react";

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
  options: OptionRecord[];
}

interface WizardProps {
  initialSteps: StepRecord[];
}

export function AestheticFinderWizard({ initialSteps }: WizardProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gold-400">Loading Aesthetic Studio...</div>}>
      <AestheticFinderContent initialSteps={initialSteps} />
    </Suspense>
  );
}

function AestheticFinderContent({ initialSteps }: WizardProps) {
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

  // Determine current active step (0 to 4)
  const getInitialStep = () => {
    if (paramSpace && paramColor && paramShape && paramStyle) return 4;
    if (paramColor && paramShape && paramStyle) return 3;
    if (paramShape && paramStyle) return 2;
    if (paramStyle) return 1;
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(getInitialStep());

  // Sync state with URL params
  useEffect(() => {
    setSelectedStyle(searchParams.get("style") || "");
    setSelectedShape(searchParams.get("shape") || "");
    setSelectedColor(searchParams.get("color") || "");
    setSelectedSpace(searchParams.get("space") || "");

    const pStyle = searchParams.get("style");
    const pShape = searchParams.get("shape");
    const pColor = searchParams.get("color");
    const pSpace = searchParams.get("space");

    if (pSpace && pColor && pShape && pStyle) {
      setCurrentStepIndex(4);
    } else if (pColor && pShape && pStyle) {
      setCurrentStepIndex(3);
    } else if (pShape && pStyle) {
      setCurrentStepIndex(2);
    } else if (pStyle) {
      setCurrentStepIndex(1);
    } else {
      setCurrentStepIndex(0);
    }
  }, [searchParams]);

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

  const handleSelectOption = (value: string) => {
    if (currentStepIndex === 0) {
      setSelectedStyle(value);
      updateUrl(value, selectedShape, selectedColor, selectedSpace);
      setCurrentStepIndex(1);
    } else if (currentStepIndex === 1) {
      setSelectedShape(value);
      updateUrl(selectedStyle, value, selectedColor, selectedSpace);
      setCurrentStepIndex(2);
    } else if (currentStepIndex === 2) {
      setSelectedColor(value);
      updateUrl(selectedStyle, selectedShape, value, selectedSpace);
      setCurrentStepIndex(3);
    } else if (currentStepIndex === 3) {
      setSelectedSpace(value);
      updateUrl(selectedStyle, selectedShape, selectedColor, value);
      setCurrentStepIndex(4);
    }
  };

  const handleJumpToStep = (index: number) => {
    // Only allow jumping to previous steps or steps that have answers
    if (index === 0) {
      setCurrentStepIndex(0);
    } else if (index === 1 && selectedStyle) {
      setCurrentStepIndex(1);
    } else if (index === 2 && selectedStyle && selectedShape) {
      setCurrentStepIndex(2);
    } else if (index === 3 && selectedStyle && selectedShape && selectedColor) {
      setCurrentStepIndex(3);
    } else if (index === 4 && selectedStyle && selectedShape && selectedColor && selectedSpace) {
      setCurrentStepIndex(4);
    }
  };

  const handleReset = () => {
    setSelectedStyle("");
    setSelectedShape("");
    setSelectedColor("");
    setSelectedSpace("");
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
    const option = step?.options.find((o) => o.value === value);
    return option?.label || value || "Not selected";
  };

  // Generated prompt for Step 5
  const styleLabel = getSelectedLabel("style", selectedStyle);
  const shapeLabel = getSelectedLabel("shape", selectedShape);
  const colorLabel = getSelectedLabel("color", selectedColor);
  const spaceLabel = getSelectedLabel("space", selectedSpace);

  const generatedVisionPrompt = `A bespoke ${styleLabel.toLowerCase()} luxury mosaic for ${spaceLabel.toLowerCase()} in ${shapeLabel.toLowerCase()} orientation, crafted with fine glass tesserae and ${colorLabel.toLowerCase()} palette accents.`;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 py-6 px-4 sm:px-6">
      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-widest">
          <span>STEP 0{currentStepIndex + 1} OF 05</span>
          <span className="font-serif italic capitalize text-base sm:text-lg text-gold-400/90">
            {SCRIPT_NAMES[currentStepIndex]}
          </span>
        </div>

        {/* Stepper Dots & Track */}
        <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
          {/* Background Track Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-800 -z-0" />
          {/* Active Fill Line */}
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-gold-500 to-amber-500 transition-all duration-500 -z-0"
            style={{ width: `calc(${(currentStepIndex / 4) * 100}% - 2.5rem)` }}
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

                {/* Stepper Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase transition-colors ${
                    isCurrent
                      ? "text-gold-400 font-bold"
                      : isCompleted
                      ? "text-neutral-200 font-medium"
                      : "text-neutral-500"
                  }`}
                >
                  {STEP_NAMES[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= STEP TITLE & DESCRIPTION ================= */}
      <div className="flex flex-col gap-2 pt-2">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold">
          {currentStep.subtitle || `STEP 0${currentStepIndex + 1} • ${currentStep.key.toUpperCase()}`}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight text-white drop-shadow-md">
          {renderStyledTitle(currentStep.title, currentStep.highlightWord)}
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
          {currentStep.description}
        </p>
      </div>

      {/* ================= STEP CONTENT / OPTIONS ================= */}
      <div className="mt-2">
        {/* Step 1: STYLE */}
        {currentStepIndex === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentStep.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.value)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 shadow-xl ${
                  selectedStyle === opt.value
                    ? "border-gold-400 ring-2 ring-gold-500/50 scale-[1.02] shadow-[0_0_25px_rgba(218,165,32,0.25)]"
                    : "border-neutral-800 bg-obsidian-900 hover:border-gold-500/50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(218,165,32,0.15)]"
                }`}
              >
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                {/* Gradient overlay for text clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex items-center justify-between">
                  <span className="font-serif font-medium text-sm sm:text-base text-white group-hover:text-gold-300 transition-colors">
                    {opt.label}
                  </span>
                  {selectedStyle === opt.value && (
                    <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-obsidian-950 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: SHAPE */}
        {currentStepIndex === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentStep.options.map((opt) => {
              const isNoPref = opt.value === "no-preference" || !opt.imageUrl;
              const isSelected = selectedShape === opt.value;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 shadow-xl ${
                    isSelected
                      ? "border-gold-400 ring-2 ring-gold-500/50 scale-[1.02] shadow-[0_0_25px_rgba(218,165,32,0.25)]"
                      : "border-neutral-800 bg-obsidian-900 hover:border-gold-500/50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(218,165,32,0.15)]"
                  } ${isNoPref ? "bg-obsidian-900/80 flex items-center justify-center p-6 text-center" : ""}`}
                >
                  {opt.imageUrl ? (
                    <>
                      <img
                        src={opt.imageUrl}
                        alt={opt.label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-90" />
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
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <span className="font-serif text-base sm:text-lg text-neutral-300 group-hover:text-gold-300 font-medium transition-colors">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-obsidian-950 mt-3 shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 3: COLOR */}
        {currentStepIndex === 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {currentStep.options.map((opt) => {
              const isSelected = selectedColor === opt.value;
              const isNoPref = opt.value === "no-preference" || (!opt.colorHex && opt.value !== "custom");

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3.5 shadow-lg min-h-[130px] ${
                    isSelected
                      ? "bg-gold-500/10 border-gold-400 ring-2 ring-gold-500/50 scale-[1.03] shadow-[0_0_20px_rgba(218,165,32,0.2)]"
                      : "bg-obsidian-900/80 border-neutral-800 hover:border-gold-500/40 hover:bg-obsidian-800/60 hover:scale-[1.02]"
                  }`}
                >
                  {/* Swatch circle */}
                  {opt.colorHex ? (
                    <div
                      className="w-11 h-11 rounded-full border border-neutral-700 shadow-md group-hover:scale-105 transition-transform"
                      style={{ background: opt.colorHex }}
                    />
                  ) : isNoPref ? (
                    <div className="w-11 h-11 rounded-full bg-obsidian-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                      <Compass className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 border border-neutral-700 shadow-md group-hover:scale-105 transition-transform" />
                  )}

                  <span className="text-xs font-medium text-neutral-300 text-center group-hover:text-gold-300 transition-colors line-clamp-1">
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 4: SPACE */}
        {currentStepIndex === 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentStep.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.value)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 shadow-xl ${
                  selectedSpace === opt.value
                    ? "border-gold-400 ring-2 ring-gold-500/50 scale-[1.02] shadow-[0_0_25px_rgba(218,165,32,0.25)]"
                    : "border-neutral-800 bg-obsidian-900 hover:border-gold-500/50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(218,165,32,0.15)]"
                }`}
              >
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex items-center justify-between">
                  <span className="font-serif font-medium text-sm sm:text-base text-white group-hover:text-gold-300 transition-colors">
                    {opt.label}
                  </span>
                  {selectedSpace === opt.value && (
                    <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-obsidian-950 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: RESULT */}
        {currentStepIndex === 4 && (
          <div className="w-full p-8 sm:p-10 rounded-3xl bg-obsidian-900/90 border border-gold-500/30 shadow-2xl backdrop-blur-2xl flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-400 font-semibold">
                YOUR TASTE
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-light text-white">
                Based on your answers, you have an <em className="italic text-gold-400 font-normal">exquisite aesthetic sense</em>.
              </h2>
            </div>

            {/* 4 Taste Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-obsidian-950/80 border border-neutral-800">
              <div className="flex flex-col gap-1 border-r border-neutral-800/80 pr-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">COLLECTION</span>
                <span className="text-sm font-serif font-bold text-white capitalize">{styleLabel}</span>
              </div>
              <div className="flex flex-col gap-1 border-r border-neutral-800/80 pr-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">SHAPE</span>
                <span className="text-sm font-serif font-bold text-white capitalize">{shapeLabel}</span>
              </div>
              <div className="flex flex-col gap-1 border-r border-neutral-800/80 pr-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">COLOUR</span>
                <span className="text-sm font-serif font-bold text-white capitalize">{colorLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">PLACEMENT</span>
                <span className="text-sm font-serif font-bold text-white capitalize">{spaceLabel}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
              Press the button below to see a one-of-a-kind design that reflects your taste. Customisation can be made to any chosen mosaic, and we&apos;re always available for a free consultation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/?mode=scratch&prompt=${encodeURIComponent(generatedVisionPrompt)}&placement=${encodeURIComponent(spaceLabel)}`}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-serif font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 fill-obsidian-950" />
                Generate my mosaic
              </Link>

              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all border border-neutral-700 hover:border-gold-500/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


