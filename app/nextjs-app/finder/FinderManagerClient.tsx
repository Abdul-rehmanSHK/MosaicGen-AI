"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Save, Plus, Trash2, CheckCircle2, Edit3, Image as ImageIcon, Palette, Layers, RefreshCw } from "lucide-react";

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
  options: OptionRecord[];
}

export function FinderManagerClient({ initialSteps }: { initialSteps: StepRecord[] }) {
  const [steps, setSteps] = useState<StepRecord[]>(initialSteps);
  const [activeStepId, setActiveStepId] = useState<string>(initialSteps[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // New option modal/form state
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionImage, setNewOptionImage] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#C59B4B");

  const currentStep = steps.find((s) => s.id === activeStepId) || steps[0];

  const handleStepChange = (field: keyof StepRecord, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === activeStepId ? { ...s, [field]: value } : s))
    );
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
      // 1. Update Step text
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
          },
        }),
      });

      if (!stepRes.ok) throw new Error("Failed to save step text");

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
            label: newOptionLabel.trim(),
            imageUrl: newOptionImage.trim() || null,
            colorHex: currentStep.key === "color" ? newOptionColor : null,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.option) {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === currentStep.id
              ? { ...s, options: [...s.options, data.option] }
              : s
          )
        );
        setNewOptionLabel("");
        setNewOptionImage("");
        setIsAddingOption(false);
      }
    } catch (err) {
      alert("Failed to add option.");
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to remove this option?")) return;

    try {
      const res = await fetch("/api/nextjs-app/finder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_OPTION",
          optionId,
        }),
      });

      if (res.ok) {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === activeStepId
              ? { ...s, options: s.options.filter((o) => o.id !== optionId) }
              : s
          )
        );
      }
    } catch (err) {
      alert("Failed to delete option.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Active Steps:</span>
          <span className="text-xs text-gold-400 font-bold">{steps.length} Wizard Stages</span>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveStep}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-gold-500/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving Live..." : "Save Step Changes"}
          </button>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStepId(s.id)}
            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              activeStepId === s.id
                ? "bg-gold-500/10 border-gold-500 shadow-md shadow-gold-500/10 text-white"
                : "bg-obsidian-900 border-neutral-800 text-neutral-400 hover:border-gold-500/40 hover:text-neutral-200"
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-gold-400">Step 0{s.stepNumber}</span>
            <span className="text-xs font-bold capitalize">{s.key}</span>
            <span className="text-[10px] text-neutral-400">{s.options.length} options</span>
          </button>
        ))}
      </div>

      {currentStep && (
        <div className="flex flex-col gap-8">
          {/* Step Meta Configuration Card */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-gold-400" />
              Step Header & Question Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-400">Step Subtitle Tag</label>
                <input
                  type="text"
                  value={currentStep.subtitle || ""}
                  onChange={(e) => handleStepChange("subtitle", e.target.value)}
                  placeholder="e.g. STEP 01 • STYLE"
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-400">Highlighted Word / Phrase (Italicized)</label>
                <input
                  type="text"
                  value={currentStep.highlightWord || ""}
                  onChange={(e) => handleStepChange("highlightWord", e.target.value)}
                  placeholder="e.g. speaks to you?"
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-neutral-400">Full Question Headline</label>
                <input
                  type="text"
                  value={currentStep.title}
                  onChange={(e) => handleStepChange("title", e.target.value)}
                  placeholder="e.g. Which mosaic style speaks to you?"
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-neutral-400">Description Subtitle</label>
                <textarea
                  rows={2}
                  value={currentStep.description}
                  onChange={(e) => handleStepChange("description", e.target.value)}
                  placeholder="Describe the objective of this step for users..."
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Options Manager */}
          {currentStep.key !== "result" && (
            <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-400" />
                  Selectable Options ({currentStep.options.length})
                </h2>

                <button
                  type="button"
                  onClick={() => setIsAddingOption(!isAddingOption)}
                  className="px-3 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-400 border border-gold-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Option
                </button>
              </div>

              {/* Add Option Form Modal/Drawer */}
              {isAddingOption && (
                <form onSubmit={handleAddOption} className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/30 flex flex-col gap-3 animate-fadeIn">
                  <span className="text-xs font-bold text-gold-300">Add Option to Step {currentStep.stepNumber}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Option Label (e.g. Modern Minimalist)"
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      required
                      className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                    />
                    {currentStep.key === "color" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newOptionColor}
                          onChange={(e) => setNewOptionColor(e.target.value)}
                          className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Hex Code"
                          value={newOptionColor}
                          onChange={(e) => setNewOptionColor(e.target.value)}
                          className="flex-1 p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-white font-mono"
                        />
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="Image URL (optional for No preference)"
                        value={newOptionImage}
                        onChange={(e) => setNewOptionImage(e.target.value)}
                        className="sm:col-span-2 p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingOption(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-bold"
                    >
                      Save Option
                    </button>
                  </div>
                </form>
              )}

              {/* Options Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStep.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500">Order #{opt.order}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Preview (Image or Swatch) */}
                    {opt.colorHex ? (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border border-neutral-700 shadow-sm shrink-0"
                          style={{ background: opt.colorHex }}
                        />
                        <input
                          type="text"
                          value={opt.colorHex}
                          onChange={(e) => handleOptionChange(opt.id, "colorHex", e.target.value)}
                          placeholder="Hex or gradient"
                          className="w-full p-1.5 rounded bg-obsidian-900 border border-neutral-800 text-xs font-mono text-gold-400"
                        />
                      </div>
                    ) : opt.imageUrl ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-neutral-800">
                        <img
                          src={opt.imageUrl}
                          alt={opt.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-12 rounded-lg bg-obsidian-900 border border-dashed border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">
                        No image (Text pill)
                      </div>
                    )}

                    {/* Label Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-neutral-400">Display Label</label>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleOptionChange(opt.id, "label", e.target.value)}
                        className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-white font-semibold focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    {/* Image URL Input if not color */}
                    {!opt.colorHex && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-neutral-400">Image Source URL</label>
                        <input
                          type="text"
                          value={opt.imageUrl || ""}
                          onChange={(e) => handleOptionChange(opt.id, "imageUrl", e.target.value)}
                          placeholder="https://..."
                          className="p-1.5 rounded bg-obsidian-900 border border-neutral-800 text-[11px] text-neutral-400 focus:border-gold-400 focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
