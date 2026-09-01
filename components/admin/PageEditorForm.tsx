"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, ExternalLink, Grid, Layers, Compass, Check, Loader2, Image as ImageIcon } from "lucide-react";

interface PageData {
  id?: string;
  title: string;
  slug: string;
  templateType: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string | null;
  secondaryText?: string | null;
}

interface PageEditorFormProps {
  initialData?: PageData;
  isNew?: boolean;
}

const TEMPLATES = [
  {
    id: "classic_grid",
    name: "Classic Grid Catalog",
    icon: Grid,
    description: "Luxury catalog grid layout featuring category filter pills, spec inspect modals, and quote request drawers.",
  },
  {
    id: "hero_showcase",
    name: "Hero Showcase Story",
    icon: Layers,
    description: "High-impact full-width editorial banner with rich storytelling text, featured imagery, and studio CTAs.",
  },
  {
    id: "split_gallery",
    name: "Split Studio & Specs",
    icon: Compass,
    description: "Interactive side-by-side split screen with live canvas design studio on one side and material specs breakdown on the other.",
  },
];

export function PageEditorForm({ initialData, isNew = false }: PageEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [templateType, setTemplateType] = useState(initialData?.templateType || "classic_grid");
  const [heading, setHeading] = useState(initialData?.heading || "");
  const [bodyText, setBodyText] = useState(initialData?.bodyText || "");
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialData?.heroImageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
  );
  const [secondaryText, setSecondaryText] = useState(initialData?.secondaryText || "");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isNew && !slug) {
      setSlug(newTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  const handleSave = async (returnToList: boolean = false) => {
    if (!title || !heading || !bodyText) {
      setError("Title, Heading, and Body Text are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const url = "/api/admin/pages";
      const method = isNew ? "POST" : "PUT";
      const cleanSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          title,
          slug: cleanSlug,
          templateType,
          heading,
          bodyText,
          heroImageUrl,
          secondaryText,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save operation failed.");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (returnToList) {
        router.push("/nextjs-app/pages");
        router.refresh();
      } else if (isNew && data.page?.id) {
        router.push(`/nextjs-app/pages/edit/${data.page.id}`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-20 animate-fadeIn">
      {/* Top Sticky Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 backdrop-blur-md shadow-xl sticky top-20 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/nextjs-app/pages"
            className="p-2 rounded-xl bg-obsidian-950 border border-neutral-800 text-neutral-300 hover:text-gold-300 hover:border-gold-500/40 flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pages List
          </Link>
          <div>
            <h1 className="text-lg font-serif font-bold text-white leading-tight">
              {isNew ? "Create New Dynamic Page" : `Edit Page: ${title || "Untitled"}`}
            </h1>
            <span className="text-[11px] text-gold-400 font-mono">
              Slug: /{slug || "url-slug"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && slug && (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 text-neutral-300 hover:text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live Preview
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-white font-serif font-bold text-xs border border-neutral-700 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-gold-400" />}
            Save & Keep Editing
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save & Return to List
          </button>
        </div>
      </div>

      {/* Save Success / Error Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> Page saved successfully to database!
          </span>
          <span className="text-[11px] font-mono text-emerald-400 opacity-80">Synced with Prisma ORM</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Page Editor Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Page Title & URL Slug */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
            <h2 className="text-base font-serif font-bold text-white border-b border-neutral-800 pb-3">
              1. Basic Page Identification
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">Page Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Italian Marble Foyer Collection"
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">URL Slug</label>
              <div className="flex items-center rounded-xl bg-obsidian-950 border border-neutral-800 overflow-hidden focus-within:border-gold-400 transition-all">
                <span className="px-3 text-xs text-gold-400 font-mono bg-obsidian-900 py-3.5 border-r border-neutral-800">
                  domain.com/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="italian-marble-foyer"
                  className="w-full p-3.5 text-xs text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Page Headings & Body Content */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
            <h2 className="text-base font-serif font-bold text-white border-b border-neutral-800 pb-3">
              2. Editorial Content & Text
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">Main Headline / H1</label>
              <input
                type="text"
                required
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Master-Crafted Italian Marble Medallions"
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">Body Text / Storytelling</label>
              <textarea
                rows={5}
                required
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write engaging architectural background text about materials, craftsmanship, or design story..."
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">Secondary Subtext (Optional)</label>
              <input
                type="text"
                value={secondaryText}
                onChange={(e) => setSecondaryText(e.target.value)}
                placeholder="e.g. Custom radii and 3D rendering support available upon architect request."
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Template Picker & Hero Image (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Section 3: Template Selector Cards */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
            <h2 className="text-base font-serif font-bold text-white border-b border-neutral-800 pb-3">
              3. Strict Template Layout System
            </h2>

            <div className="flex flex-col gap-3">
              {TEMPLATES.map((tmpl) => {
                const IconComponent = tmpl.icon;
                const isSelected = templateType === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setTemplateType(tmpl.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-gold-500/10 border-gold-400 shadow-md shadow-gold-500/10 scale-[1.01]"
                        : "bg-obsidian-950/70 border-neutral-800 hover:border-gold-500/30"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        isSelected ? "bg-gold-500 text-obsidian-950 font-bold" : "bg-obsidian-900 text-gold-400"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-serif font-bold text-white">{tmpl.name}</h3>
                        {isSelected && <Check className="w-4 h-4 text-gold-400" />}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{tmpl.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Hero Image Preview */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
            <h2 className="text-base font-serif font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gold-400" /> 4. Hero Banner Image
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-300">Hero Image URL</label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>

            {heroImageUrl && (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gold-500/30 shadow-md">
                <Image src={heroImageUrl} alt="Hero Preview" fill className="object-cover" />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-obsidian-950/80 backdrop-blur-md text-[10px] font-mono text-gold-300 font-bold">
                  Image Live Preview
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
