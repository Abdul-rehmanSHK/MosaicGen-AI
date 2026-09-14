"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Palette,
  Layers,
  RefreshCw,
  ExternalLink,
  Check,
  Search,
  Calendar,
  User,
  Compass,
  Eye,
  Loader2,
  CheckCheck,
  UploadCloud,
} from "lucide-react";

interface OptionRecord {
  id: string;
  stepId: string;
  label: string;
  value: string;
  imageUrl?: string | null;
  colorHex?: string | null;
  order: number;
}

interface StepRecord {
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

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  specs: string;
}

interface FinderResultRecord {
  id: string;
  userEmail?: string | null;
  style: string;
  shape: string;
  color: string;
  space: string;
  generatedPrompt: string;
  createdAt: string | Date;
}

export function FinderManagerClient({
  initialSteps,
  availableProducts = [],
  initialResults = [],
}: {
  initialSteps: StepRecord[];
  availableProducts?: Product[];
  initialResults?: FinderResultRecord[];
}) {
  // Main view switcher: "steps" vs "results"
  const [mainView, setMainView] = useState<"steps" | "results">("steps");

  const [steps, setSteps] = useState<StepRecord[]>(initialSteps);
  const [activeStepId, setActiveStepId] = useState<string>(initialSteps[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Stored Results state
  const [results, setResults] = useState<FinderResultRecord[]>(initialResults);
  const [resultsSearch, setResultsSearch] = useState("");
  const [isDeletingResult, setIsDeletingResult] = useState(false);
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
  const [isBulkDeletingResults, setIsBulkDeletingResults] = useState(false);

  // New option modal/form state
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionImage, setNewOptionImage] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#C59B4B");
  const [isUploadingOptionImage, setIsUploadingOptionImage] = useState(false);
  const [uploadingCardOptionId, setUploadingCardOptionId] = useState<string | null>(null);

  // Upload image file and compress to WebP
  const handleUploadOptionFile = async (file: File, forOptionId?: string) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (forOptionId) {
      setUploadingCardOptionId(forOptionId);
    } else {
      setIsUploadingOptionImage(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/nextjs-app/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image optimization failed");

      const optimizedUrl = data.media?.url;
      if (forOptionId) {
        handleOptionChange(forOptionId, "imageUrl", optimizedUrl);
      } else {
        setNewOptionImage(optimizedUrl);
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploadingOptionImage(false);
      setUploadingCardOptionId(null);
    }
  };

  const toggleSelectResult = (id: string) => {
    setSelectedResultIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllResults = (items: FinderResultRecord[]) => {
    const itemIds = items.map((r) => r.id);
    const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedResultIds.includes(id));
    if (allSelected) {
      setSelectedResultIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedResultIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBulkDeleteResults = async () => {
    if (selectedResultIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedResultIds.length} quiz results? This cannot be undone.`)) return;
    setIsBulkDeletingResults(true);
    try {
      const res = await fetch("/api/finder/result", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedResultIds }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setResults((prev) => prev.filter((r) => !selectedResultIds.includes(r.id)));
      setSelectedResultIds([]);
      setSaveMessage("Selected quiz results deleted.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkDeletingResults(false);
    }
  };

  const currentStep = steps.find((s) => s.id === activeStepId) || steps[0];

  // Parse featured product IDs for Step 5 (Result)
  const currentFeaturedProductIds: string[] = React.useMemo(() => {
    if (!currentStep || !currentStep.featuredProductIds) return [];
    try {
      return JSON.parse(currentStep.featuredProductIds);
    } catch {
      return [];
    }
  }, [currentStep]);

  const handleStepChange = (field: keyof StepRecord, value: any) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === activeStepId ? { ...s, [field]: value } : s))
    );
  };

  const handleToggleProductSelection = (productId: string) => {
    const current = currentFeaturedProductIds;
    let next: string[];
    if (current.includes(productId)) {
      next = current.filter((id) => id !== productId);
    } else {
      next = [...current, productId];
    }
    handleStepChange("featuredProductIds", JSON.stringify(next));
  };

  const handleOptionChange = (optionId: string, field: keyof OptionRecord, value: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== activeStepId) return s;
        return {
          ...s,
          options: s.options.map((opt) =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
          ),
        };
      })
    );
  };

  const handleSaveStep = async () => {
    if (!currentStep) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 1. Update Step text & featured products
      const stepRes = await fetch("/api/nextjs-app/finder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STEP",
          stepId: currentStep.id,
          stepData: {
            title: currentStep.title,
            highlightWord: currentStep.highlightWord,
            subtitle: currentStep.subtitle,
            description: currentStep.description,
            featuredProductIds: currentStep.featuredProductIds,
          },
        }),
      });

      if (!stepRes.ok) throw new Error("Failed to save step settings");

      // 2. Update Options
      for (const opt of currentStep.options) {
        await fetch("/api/nextjs-app/finder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_OPTION",
            optionId: opt.id,
            optionData: {
              label: opt.label,
              value: opt.value,
              imageUrl: opt.imageUrl,
              colorHex: opt.colorHex,
            },
          }),
        });
      }

      setSaveMessage("Changes saved successfully to live database!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to save changes: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionLabel.trim() || !currentStep) return;

    try {
      const res = await fetch("/api/nextjs-app/finder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_OPTION",
          stepId: currentStep.id,
          optionData: {
            label: newOptionLabel,
            imageUrl: newOptionImage || null,
            colorHex: newOptionColor || null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add option");

      setSteps((prev) =>
        prev.map((s) => {
          if (s.id !== currentStep.id) return s;
          return {
            ...s,
            options: [...s.options, data.option],
          };
        })
      );

      setNewOptionLabel("");
      setNewOptionImage("");
      setNewOptionColor("#C59B4B");
      setIsAddingOption(false);
    } catch (err: any) {
      alert("Error adding option: " + err.message);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      const res = await fetch("/api/nextjs-app/finder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_OPTION",
          optionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete option");

      setSteps((prev) =>
        prev.map((s) => {
          if (s.id !== activeStepId) return s;
          return {
            ...s,
            options: s.options.filter((opt) => opt.id !== optionId),
          };
        })
      );
    } catch (err: any) {
      alert("Error deleting option: " + err.message);
    }
  };

  // Delete a saved user quiz result
  const handleDeleteResult = async (resultId: string) => {
    if (!confirm("Are you sure you want to delete this stored quiz result?")) return;
    setIsDeletingResult(true);

    try {
      const res = await fetch(`/api/finder/result?id=${resultId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      setResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch (err: any) {
      alert("Error deleting result: " + err.message);
    } finally {
      setIsDeletingResult(false);
    }
  };

  // Filtered results
  const filteredResults = results.filter((r) => {
    const q = resultsSearch.toLowerCase();
    return (
      (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
      r.style.toLowerCase().includes(q) ||
      r.shape.toLowerCase().includes(q) ||
      r.color.toLowerCase().includes(q) ||
      r.space.toLowerCase().includes(q) ||
      r.generatedPrompt.toLowerCase().includes(q)
    );
  });

  const isStepFiveResult = currentStep?.key === "result" || currentStep?.stepNumber === 5;

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Feedback */}
      {saveMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-obsidian-900 border border-gold-500/40 text-gold-300 text-xs shadow-2xl shadow-gold-500/10 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="font-medium">{saveMessage}</span>
        </div>
      )}

      {/* Top Level Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-obsidian-900 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainView("steps")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainView === "steps"
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Quiz Builder & Steps ({steps.length})
          </button>

          <button
            type="button"
            onClick={() => setMainView("results")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainView === "results"
                ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Stored User Results ({results.length})
          </button>
        </div>

        {mainView === "steps" && (
          <div className="flex items-center gap-2.5 px-2">
            <Link
              href="/finder?style=geometric&shape=square&color=gold&space=pool"
              target="_blank"
              className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 border border-neutral-700 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-gold-400" /> Preview Live Result <ExternalLink className="w-3 h-3 text-neutral-500" />
            </Link>

            <button
              type="button"
              onClick={handleSaveStep}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Step Changes
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. QUIZ BUILDER & STEPS VIEW */}
      {/* ========================================================================= */}
      {mainView === "steps" ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {steps.map((step) => {
              const isActive = step.id === activeStepId;
              const isResult = step.key === "result" || step.stepNumber === 5;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    isActive
                      ? "bg-gold-500/10 border-gold-400 ring-2 ring-gold-500/30 shadow-lg scale-[1.02]"
                      : "bg-obsidian-900 border-neutral-800 hover:border-neutral-700 text-neutral-400"
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-widest uppercase block text-gold-400">
                    STEP 0{step.stepNumber}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-white capitalize mt-0.5">{step.key}</h3>
                  <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                    {isResult ? "Result Showcase" : `${step.options.length} options`}
                  </span>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Step Settings Card */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-white text-base">
                  {isStepFiveResult ? "Result Stage Settings & Styling" : "Step Header & Question Settings"}
                </h3>
              </div>
              {isStepFiveResult && (
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-300 font-mono text-[10px]">
                  • Gold Background Styled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium">Step Subtitle Tag</label>
                <input
                  type="text"
                  value={currentStep?.subtitle || ""}
                  onChange={(e) => handleStepChange("subtitle", e.target.value)}
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium">Highlighted Word / Phrase (Italicized)</label>
                <input
                  type="text"
                  value={currentStep?.highlightWord || ""}
                  onChange={(e) => handleStepChange("highlightWord", e.target.value)}
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-gold-300 font-serif italic text-sm focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-neutral-300 font-medium">Full Question Headline</label>
              <input
                type="text"
                value={currentStep?.title || ""}
                onChange={(e) => handleStepChange("title", e.target.value)}
                className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white font-serif font-bold text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-neutral-300 font-medium">Description Subtitle</label>
              <textarea
                rows={2}
                value={currentStep?.description || ""}
                onChange={(e) => handleStepChange("description", e.target.value)}
                className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 5 RESULT: SELECT PRODUCTS TO SHOWCASE AT BOTTOM OF RESULT */}
          {/* ========================================================================= */}
          {isStepFiveResult ? (
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <h3 className="font-serif font-bold text-white text-base">
                      Curated Mosaic Products at Bottom of Result
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select the actual mosaic products from your catalog to showcase at the bottom of the gold result card instead of hardcoding.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-xs">
                  {currentFeaturedProductIds.length} Products Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 max-h-96 overflow-y-auto p-1">
                {availableProducts.map((prod) => {
                  const isSelected = currentFeaturedProductIds.includes(prod.id);
                  const selectedIndex = currentFeaturedProductIds.indexOf(prod.id);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleProductSelection(prod.id)}
                      className={`group relative rounded-2xl bg-obsidian-950 border overflow-hidden cursor-pointer transition-all flex flex-col ${
                        isSelected
                          ? "border-gold-400 ring-2 ring-gold-500/40 shadow-lg scale-[1.02]"
                          : "border-neutral-800 hover:border-neutral-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="relative aspect-square w-full bg-obsidian-900">
                        <Image src={prod.sampleImageUrl} alt={prod.title} fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gold-500 text-obsidian-950 flex items-center gap-1 font-bold text-[10px] shadow">
                            <Check className="w-3 h-3" /> #{selectedIndex + 1}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 flex flex-col gap-0.5">
                        <span className="font-serif font-bold text-white truncate text-xs">{prod.title}</span>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span className="text-gold-400">${prod.pricePerSqFt}/sq.ft</span>
                          <span className="truncate max-w-[60px]">{prod.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-xs text-neutral-400">
                  {currentFeaturedProductIds.length > 0
                    ? `Displaying these ${currentFeaturedProductIds.length} chosen products on the live result page.`
                    : "No specific products checked — will automatically display top active catalog products."}
                </span>
                <button
                  type="button"
                  onClick={handleSaveStep}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" /> Save Result Products
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STEPS 1-4: INTERACTIVE OPTIONS MANAGER */
            /* ========================================================================= */
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-gold-400" />
                  <h3 className="font-serif font-bold text-white text-base">
                    Interactive Step Options ({currentStep.options.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingOption(true)}
                  className="px-4 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              </div>

              {/* Add Option Form Modal */}
              {isAddingOption && (
                <form onSubmit={handleAddOption} className="p-4 rounded-2xl bg-obsidian-950 border border-gold-500/30 flex flex-col gap-4 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                    <h4 className="font-serif font-bold text-white text-sm">Add New Option to {currentStep.key}</h4>
                    <button type="button" onClick={() => setIsAddingOption(false)} className="text-neutral-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-neutral-300 font-medium">Label / Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Byzantine Gold"
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        className="p-2.5 rounded-xl bg-obsidian-900 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    {/* Image Upload with Drag & Drop instead of URL only */}
                    <div className="flex flex-col gap-1">
                      <label className="text-neutral-300 font-medium flex items-center justify-between">
                        <span>Upload Image File</span>
                        <span className="text-[10px] text-gold-400 font-mono">WebP Auto-Compressed</span>
                      </label>
                      {newOptionImage ? (
                        <div className="relative h-12 w-full rounded-xl overflow-hidden border border-gold-500/40 bg-obsidian-900 flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                              <Image src={newOptionImage} alt="Preview" fill className="object-cover" />
                            </div>
                            <span className="text-[10px] text-neutral-300 truncate max-w-[90px] font-mono">
                              WebP Ready
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewOptionImage("")}
                            className="text-neutral-400 hover:text-red-400 text-xs px-1"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 h-12 border border-dashed border-gold-500/30 hover:border-gold-400 rounded-xl bg-obsidian-900/80 cursor-pointer transition-colors px-2 text-center">
                          {isUploadingOptionImage ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-gold-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Compressing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 hover:text-white">
                              <UploadCloud className="w-3.5 h-3.5 text-gold-400" />
                              <span>Choose image file</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingOptionImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadOptionFile(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}

                      <input
                        type="url"
                        placeholder="Or enter URL: https://..."
                        value={newOptionImage}
                        onChange={(e) => setNewOptionImage(e.target.value)}
                        className="p-1 rounded-lg bg-obsidian-900 border border-neutral-800 text-neutral-400 placeholder-neutral-600 focus:outline-none focus:border-gold-400 font-mono text-[9px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-neutral-300 font-medium">Color Hex (Optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newOptionColor}
                          onChange={(e) => setNewOptionColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={newOptionColor}
                          onChange={(e) => setNewOptionColor(e.target.value)}
                          className="flex-1 p-2.5 rounded-xl bg-obsidian-900 border border-neutral-800 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingOption(false)}
                      className="px-3 py-1.5 rounded-xl bg-obsidian-800 text-neutral-400 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gold-500 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save Option
                    </button>
                  </div>
                </form>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStep.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-3 text-xs justify-between group hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {opt.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                          <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                        </div>
                      ) : opt.colorHex ? (
                        <div
                          className="w-12 h-12 rounded-xl border border-neutral-700 shrink-0 shadow"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
                          <Compass className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] text-neutral-500 font-mono">LABEL</label>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(opt.id, "label", e.target.value)}
                          className="w-full bg-transparent border-b border-neutral-800 text-white font-medium focus:border-gold-400 focus:outline-none pb-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-900">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-neutral-500 font-mono w-14">IMAGE</label>
                        <input
                          type="text"
                          value={opt.imageUrl || ""}
                          placeholder="Image URL"
                          onChange={(e) => handleOptionChange(opt.id, "imageUrl", e.target.value)}
                          className="flex-1 p-1.5 rounded-lg bg-obsidian-900 border border-neutral-800 text-neutral-300 font-mono text-[10px] focus:outline-none focus:border-gold-400"
                        />
                        <label 
                          className="p-1.5 rounded-lg bg-obsidian-900 hover:bg-gold-500/20 text-gold-400 border border-neutral-800 hover:border-gold-500/40 cursor-pointer transition-colors shrink-0" 
                          title="Upload new image file (compresses to WebP)"
                        >
                          {uploadingCardOptionId === opt.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingCardOptionId === opt.id}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadOptionFile(f, opt.id);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {opt.colorHex !== undefined && (
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-neutral-500 font-mono w-14">COLOR</label>
                          <input
                            type="color"
                            value={opt.colorHex || "#C59B4B"}
                            onChange={(e) => handleOptionChange(opt.id, "colorHex", e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={opt.colorHex || ""}
                            placeholder="#HEX"
                            onChange={(e) => handleOptionChange(opt.id, "colorHex", e.target.value)}
                            className="flex-1 p-1.5 rounded-lg bg-obsidian-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. STORED USER QUIZ RESULTS & SUBMISSIONS TAB */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search results by email, collection, placement..."
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-gold-500/50"
              />
            </div>

            <span className="text-xs font-mono text-neutral-400">
              Showing {filteredResults.length} of {results.length} submissions
            </span>
          </div>

          {/* Bulk Action Toolbar for Results */}
          {selectedResultIds.length > 0 && (
            <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 font-mono font-bold text-xs flex items-center justify-center">
                  {selectedResultIds.length}
                </span>
                <span className="text-xs font-semibold text-white">
                  {selectedResultIds.length} {selectedResultIds.length === 1 ? "quiz result" : "quiz results"} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedResultIds([])}
                  className="text-neutral-400 hover:text-white text-xs underline cursor-pointer ml-1"
                >
                  Deselect all
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isBulkDeletingResults}
                  onClick={handleBulkDeleteResults}
                  className="px-4 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected Results
                </button>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
            {filteredResults.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Compass className="w-12 h-12 text-neutral-600" />
                <p className="text-sm font-serif text-neutral-400">No stored quiz results found</p>
                <p className="text-xs text-neutral-500">
                  When visitors complete the 5-step quiz on /finder, their aesthetic taste selections are stored here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredResults.length > 0 && filteredResults.every((r) => selectedResultIds.includes(r.id))}
                          onChange={() => handleSelectAllResults(filteredResults)}
                          className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">User</th>
                      <th className="p-4">Style & Shape</th>
                      <th className="p-4">Color & Space</th>
                      <th className="p-4">Generated Prompt</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredResults.map((res) => {
                      const isSelected = selectedResultIds.includes(res.id);
                      return (
                        <tr key={res.id} className={`hover:bg-obsidian-800/50 transition-colors ${isSelected ? "bg-gold-500/5" : ""}`}>
                          <td className="p-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectResult(res.id)}
                              className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xs">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-medium text-white block">
                                  {res.userEmail || "Anonymous Visitor"}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono">Quiz Completed</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/20 font-mono text-[10px] uppercase font-bold w-fit">
                                Style: {res.style}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">Shape: {res.shape}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px] uppercase font-bold w-fit">
                                Color: {res.color}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">Space: {res.space}</span>
                            </div>
                          </td>

                          <td className="p-4 max-w-xs truncate text-neutral-300 text-[11px]" title={res.generatedPrompt}>
                            {res.generatedPrompt}
                          </td>

                          <td className="p-4 text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                            {new Date(res.createdAt).toLocaleDateString()}{" "}
                            {new Date(res.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteResult(res.id)}
                              disabled={isDeletingResult}
                              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors"
                              title="Delete result"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
