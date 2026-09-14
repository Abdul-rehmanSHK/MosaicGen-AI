"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Grid,
  Layers,
  Compass,
  Check,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  AlertTriangle,
  Sparkles,
  Eye,
  FileText,
  X,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  specs: string;
}

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  templateType: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string | null;
  secondaryText?: string | null;
  featuredProductIds?: string | null;
  updatedAt?: Date | string;
}

export function PagesManagerClient({
  initialPages,
  availableProducts,
}: {
  initialPages: PageRecord[];
  availableProducts: Product[];
}) {
  const [pages, setPages] = useState<PageRecord[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string>(initialPages[0]?.id || "");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Page State
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("hero_showcase");
  const [newHeading, setNewHeading] = useState("");
  const [newBodyText, setNewBodyText] = useState("");
  const [newHeroImageUrl, setNewHeroImageUrl] = useState(
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
  );
  const [newSecondaryText, setNewSecondaryText] = useState("");
  const [newSelectedProductIds, setNewSelectedProductIds] = useState<string[]>([]);

  // State for image upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPage = pages.find((p) => p.id === activePageId) || pages[0];

  // Parse selected product IDs for current page
  const currentSelectedProductIds: string[] = React.useMemo(() => {
    if (!currentPage || !currentPage.featuredProductIds) return [];
    try {
      return JSON.parse(currentPage.featuredProductIds);
    } catch {
      return [];
    }
  }, [currentPage]);

  const handleFieldChange = (field: keyof PageRecord, value: any) => {
    setPages((prev) =>
      prev.map((p) => (p.id === activePageId ? { ...p, [field]: value } : p))
    );
  };

  const handleToggleProductSelection = (productId: string) => {
    if (!currentPage) return;
    const current = currentSelectedProductIds;
    let next: string[];
    if (current.includes(productId)) {
      next = current.filter((id) => id !== productId);
    } else {
      next = [...current, productId];
    }
    handleFieldChange("featuredProductIds", JSON.stringify(next));
  };

  const handleToggleNewProductSelection = (productId: string) => {
    if (newSelectedProductIds.includes(productId)) {
      setNewSelectedProductIds(newSelectedProductIds.filter((id) => id !== productId));
    } else {
      setNewSelectedProductIds([...newSelectedProductIds, productId]);
    }
  };

  // Upload image to WebP optimization endpoint
  const handleImageUpload = async (files: FileList | null, isForNewPage = false) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/nextjs-app/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      if (isForNewPage) {
        setNewHeroImageUrl(data.media.url);
      } else {
        handleFieldChange("heroImageUrl", data.media.url);
      }

      showToast("Hero image uploaded & optimized to WebP!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save current active page
  const handleSaveCurrentPage = async () => {
    if (!currentPage) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/nextjs-app/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentPage.id,
          title: currentPage.title,
          slug: currentPage.slug,
          templateType: currentPage.templateType,
          heading: currentPage.heading,
          bodyText: currentPage.bodyText,
          heroImageUrl: currentPage.heroImageUrl,
          secondaryText: currentPage.secondaryText,
          featuredProductIds: currentPage.featuredProductIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save page changes");

      showToast(`Page "${currentPage.title}" updated successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to save page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Create new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/nextjs-app/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || newTitle.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
          templateType: newTemplateType,
          heading: newHeading,
          bodyText: newBodyText,
          heroImageUrl: newHeroImageUrl,
          secondaryText: newSecondaryText,
          featuredProductIds: JSON.stringify(newSelectedProductIds),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create page");

      setPages((prev) => [...prev, data.page]);
      setActivePageId(data.page.id);
      setIsCreatingNew(false);

      // Reset
      setNewTitle("");
      setNewSlug("");
      setNewHeading("");
      setNewBodyText("");
      setNewSecondaryText("");
      setNewSelectedProductIds([]);

      showToast(`Page "${data.page.title}" created successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to create page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete current page
  const handleDeletePage = async (pageId: string) => {
    const pageToDelete = pages.find((p) => p.id === pageId);
    if (!pageToDelete) return;

    if (!confirm(`Are you sure you want to delete "${pageToDelete.title}" (/${pageToDelete.slug})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/nextjs-app/pages?id=${pageId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete page");

      const remaining = pages.filter((p) => p.id !== pageId);
      setPages(remaining);
      if (remaining.length > 0) {
        setActivePageId(remaining[0].id);
      }
      showToast(`Page "${pageToDelete.title}" deleted.`);
    } catch (err: any) {
      alert("Error deleting page: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-obsidian-900 border border-gold-500/40 text-gold-300 text-xs shadow-2xl shadow-gold-500/10 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP TABS: PAGES SELECTOR (EXACTLY LIKE AESTHETIC FINDER STEPS CMS) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-obsidian-900 border border-neutral-800 shadow-lg">
        {pages.map((pg, idx) => {
          const isActive = !isCreatingNew && pg.id === activePageId;
          return (
            <button
              key={pg.id}
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setActivePageId(pg.id);
                setError(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 scale-[1.02]"
                  : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
              }`}
            >
              {pg.templateType === "classic_grid" && <Grid className="w-3.5 h-3.5" />}
              {pg.templateType === "hero_showcase" && <Layers className="w-3.5 h-3.5" />}
              {pg.templateType === "split_gallery" && <Compass className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[200px]">{pg.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? "bg-obsidian-950/20 text-obsidian-950 font-bold" : "bg-obsidian-800 text-neutral-400"
                }`}
              >
                /{pg.slug}
              </span>
            </button>
          );
        })}

        {/* Add New Page Tab Button */}
        <button
          type="button"
          onClick={() => {
            setIsCreatingNew(true);
            setError(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isCreatingNew
              ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20 scale-[1.02]"
              : "text-gold-400 hover:text-gold-300 hover:bg-gold-500/10 border border-dashed border-gold-500/30"
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Add New Page
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. NEW PAGE CREATION VIEW */}
      {/* ========================================================================= */}
      {isCreatingNew ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">
                  New Dynamic Architectural Page
                </span>
                <h2 className="text-xl font-serif font-bold text-white">Create New Page</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="flex flex-col gap-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Page Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Minimalist Mosaic Gallery"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
                    }}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 text-sm font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">URL Slug (e.g. /modern-gallery)</label>
                  <input
                    type="text"
                    required
                    placeholder="modern-gallery"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium">Layout Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: "hero_showcase", label: "Hero Showcase", desc: "Parallax hero banner with narrative story & featured grid" },
                    { type: "classic_grid", label: "Classic Grid", desc: "Filterable mosaic texture catalog with interactive preview cards" },
                    { type: "split_gallery", label: "Split Gallery", desc: "Dual-column luxury architectural visual showcase" },
                  ].map((tpl) => (
                    <div
                      key={tpl.type}
                      onClick={() => setNewTemplateType(tpl.type)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                        newTemplateType === tpl.type
                          ? "bg-gold-500/10 border-gold-400 text-white"
                          : "bg-obsidian-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <span className="font-serif font-bold text-sm text-gold-300">{tpl.label}</span>
                      <span className="text-[11px] text-neutral-400">{tpl.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Main Headline / Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masterpieces in Marble & Byzantine Glass"
                    value={newHeading}
                    onChange={(e) => setNewHeading(e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Hero Image URL (or upload WebP)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newHeroImageUrl}
                      onChange={(e) => setNewHeroImageUrl(e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files, true)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3 py-2.5 rounded-xl bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-neutral-700 text-xs flex items-center gap-1.5 transition-all shrink-0"
                    >
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      Upload WebP
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Body Text / Editorial Paragraph</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the collection, space architectural application, and mosaic techniques..."
                    value={newBodyText}
                    onChange={(e) => setNewBodyText(e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Secondary Supporting Text (Subtitle/Notes)</label>
                  <textarea
                    rows={3}
                    placeholder="Additional installation notes, custom sizing details, or craft story..."
                    value={newSecondaryText}
                    onChange={(e) => setNewSecondaryText(e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Product Selection for Bottom of Page */}
              <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-white text-sm">
                      Select Products to Showcase at the Bottom of This Page
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Choose which catalog mosaic references will appear in the showcase section.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gold-400">
                    {newSelectedProductIds.length} products selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-1">
                  {availableProducts.map((prod) => {
                    const isSelected = newSelectedProductIds.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleNewProductSelection(prod.id)}
                        className={`group relative rounded-xl bg-obsidian-950 border overflow-hidden cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? "border-gold-400 ring-2 ring-gold-500/30"
                            : "border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="relative aspect-square w-full">
                          <Image src={prod.sampleImageUrl} alt={prod.title} fill className="object-cover" />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold-500 text-obsidian-950 flex items-center justify-center font-bold text-xs shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex flex-col">
                          <span className="font-bold text-white truncate text-[11px]">{prod.title}</span>
                          <span className="text-[10px] text-gold-400 font-mono">${prod.pricePerSqFt}/sq.ft</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2.5 rounded-xl bg-obsidian-800 text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Publish Page
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : currentPage ? (
        /* ========================================================================= */
        /* 3. ACTIVE PAGE DIRECT IN-SECTION FIELD EDITOR (LIKE FINDER CMS STEPS) */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="p-5 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-white">{currentPage.title}</h2>
                  <span className="text-[11px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                    /{currentPage.slug}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Template: <strong className="text-neutral-200 capitalize">{currentPage.templateType.replace("_", " ")}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href={`/${currentPage.slug}`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                title="View live page on website"
              >
                <Eye className="w-3.5 h-3.5 text-gold-400" /> View Live Page <ExternalLink className="w-3 h-3 text-neutral-500" />
              </Link>

              <button
                type="button"
                onClick={() => handleDeletePage(currentPage.id)}
                className="p-2 rounded-xl bg-obsidian-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors"
                title="Delete this page"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSaveCurrentPage}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Form Fields: All Page Data in Direct Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Content Fields */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* General Settings Card */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4 text-xs">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Layers className="w-4 h-4 text-gold-400" />
                  <h3 className="font-serif font-bold text-white text-base">Page Header & Metadata</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Page Title</label>
                    <input
                      type="text"
                      value={currentPage.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 text-sm font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">URL Slug (Identifier)</label>
                    <input
                      type="text"
                      value={currentPage.slug}
                      onChange={(e) => handleFieldChange("slug", e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Layout Template</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { type: "hero_showcase", label: "Hero Showcase", icon: Layers },
                      { type: "classic_grid", label: "Classic Grid", icon: Grid },
                      { type: "split_gallery", label: "Split Gallery", icon: Compass },
                    ].map((tpl) => {
                      const Icon = tpl.icon;
                      const isSelected = currentPage.templateType === tpl.type;
                      return (
                        <div
                          key={tpl.type}
                          onClick={() => handleFieldChange("templateType", tpl.type)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-gold-500/10 border-gold-400 text-white"
                              : "bg-obsidian-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-gold-400" : "text-neutral-500"}`} />
                          <span className="font-semibold text-xs">{tpl.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Main Headline</label>
                  <input
                    type="text"
                    value={currentPage.heading}
                    onChange={(e) => handleFieldChange("heading", e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-serif font-bold text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Editorial Body Text</label>
                  <textarea
                    rows={3}
                    value={currentPage.bodyText}
                    onChange={(e) => handleFieldChange("bodyText", e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-medium">Secondary Supporting Text / Story</label>
                  <textarea
                    rows={2}
                    value={currentPage.secondaryText || ""}
                    onChange={(e) => handleFieldChange("secondaryText", e.target.value)}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Product Selection for Bottom of Page Card */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4 text-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base">
                      Products to Showcase at Bottom of Page
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Check the mosaic items below that should appear in this page's showcase section.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-xs self-start sm:self-auto">
                    {currentSelectedProductIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {availableProducts.map((prod) => {
                    const isSelected = currentSelectedProductIds.includes(prod.id);
                    const selectedIndex = currentSelectedProductIds.indexOf(prod.id);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProductSelection(prod.id)}
                        className={`group relative rounded-2xl bg-obsidian-950 border overflow-hidden cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? "border-gold-400 ring-2 ring-gold-500/30 shadow-lg"
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
                            <span className="truncate max-w-[70px]">{prod.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Hero Image & Live Preview Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Hero Image Card */}
              <div className="sticky top-6 p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gold-400" />
                    <h4 className="font-serif font-bold text-white text-sm">Hero Image</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">• WebP optimized</span>
                </div>

                {/* Thumbnail Preview */}
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-obsidian-950 border border-neutral-800 overflow-hidden shadow">
                  {currentPage.heroImageUrl ? (
                    <Image
                      src={currentPage.heroImageUrl}
                      alt={currentPage.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      No hero image set
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files, false)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full py-2.5 rounded-xl bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-neutral-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  Upload New Hero (Auto WebP)
                </button>

                {/* Hero URL Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-400 font-medium text-[11px]">Hero Image URL</label>
                  <input
                    type="text"
                    value={currentPage.heroImageUrl || ""}
                    onChange={(e) => handleFieldChange("heroImageUrl", e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-gold-400"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveCurrentPage}
                  disabled={isSaving}
                  className="w-full mt-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-neutral-400">
          No pages found. Click "Add New Page" to create your first page.
        </div>
      )}
    </div>
  );
}
