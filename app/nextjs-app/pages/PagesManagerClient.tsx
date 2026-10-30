"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
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
  Compass,
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

  const isCoreStudioPage = useMemo(() => {
    if (!currentPage) return false;
    return ["customize-space", "from-scratch", "finder"].includes(currentPage.slug);
  }, [currentPage]);

  // Resolve live page URL
  const getLivePageUrl = (slug: string) => {
    if (slug === "customize-space") return "/";
    if (slug === "from-scratch") return "/from-scratch";
    if (slug === "finder") return "/finder";
    return `/${slug}`;
  };

  // Resolve user-friendly template name
  const getTemplateName = (slug: string) => {
    if (slug === "customize-space") return "Interactive Studio & Inpainting Template (Home)";
    if (slug === "from-scratch") return "Generative Architectural Mosaic Template (/from-scratch)";
    if (slug === "finder") return "Aesthetic Preference Wizard Template (/finder)";
    return "Architectural Hero Showcase Template";
  };

  // Parse selected product IDs for current page
  const currentSelectedProductIds: string[] = useMemo(() => {
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

      showToast(`Page "${currentPage.title}" updated successfully! Changes are live on the website.`);
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

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    const pageToDelete = pages.find((p) => p.id === pageId);
    if (!pageToDelete) return;

    if (["customize-space", "from-scratch", "finder"].includes(pageToDelete.slug)) {
      alert("Core studio pages cannot be deleted.");
      return;
    }

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
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 border border-stone-800 text-white text-xs shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP TABS: PAGES SELECTOR (3 Core Studio Pages + Add New Page) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
        {pages.map((pg) => {
          const isActive = !isCreatingNew && pg.id === activePageId;
          const routeLabel = pg.slug === "customize-space" ? "/" : `/${pg.slug}`;

          return (
            <button
              key={pg.id}
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setActivePageId(pg.id);
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">{pg.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-stone-800 text-amber-300 font-bold" : "bg-stone-100 text-stone-600"
                }`}
              >
                {routeLabel}
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
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isCreatingNew
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-dashed border-stone-300"
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
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest block font-bold">
                  New Dynamic Architectural Page
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900">Create New Page</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="flex flex-col gap-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 font-medium">Page Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Minimalist Mosaic Gallery"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
                    }}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-sm font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 font-medium">URL Slug (e.g. modern-gallery)</label>
                  <input
                    type="text"
                    required
                    placeholder="modern-gallery"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 font-medium">Main Headline / Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masterpieces in Marble & Byzantine Glass"
                    value={newHeading}
                    onChange={(e) => setNewHeading(e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 font-medium">Category Badge / Kicker Text</label>
                  <input
                    type="text"
                    placeholder="e.g. BESPOKE MOSAIC ATELIER"
                    value={newSecondaryText}
                    onChange={(e) => setNewSecondaryText(e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 font-mono uppercase text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 font-medium">Editorial Body Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the collection, space architectural application, and mosaic techniques..."
                  value={newBodyText}
                  onChange={(e) => setNewBodyText(e.target.value)}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 resize-none leading-relaxed"
                />
              </div>

              {/* Product Selection */}
              <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">
                      Select Products to Showcase at the Bottom of This Page
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Choose which catalog mosaic references will appear in the showcase section.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-amber-800 font-bold">
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
                        className={`group relative rounded-xl bg-white border overflow-hidden cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? "border-stone-900 ring-2 ring-stone-900/10 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="relative aspect-square w-full">
                          <Image src={prod.sampleImageUrl} alt={prod.title} fill className="object-cover" />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex flex-col">
                          <span className="font-bold text-stone-900 truncate text-[11px]">{prod.title}</span>
                          <span className="text-[10px] text-stone-500 font-mono">${prod.pricePerSqFt}/sq.ft</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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
        /* 3. ACTIVE PAGE CMS FIELD EDITOR */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-serif font-bold text-stone-900">{currentPage.title}</h2>
                  <span className="text-[11px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                    {currentPage.slug === "customize-space" ? "/" : `/${currentPage.slug}`}
                  </span>
                  {isCoreStudioPage && (
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      Core Studio Page
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Template: <strong className="text-stone-800">{getTemplateName(currentPage.slug)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={getLivePageUrl(currentPage.slug)}
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                title="View live page on website"
              >
                <Eye className="w-3.5 h-3.5 text-stone-500" /> View Live Page <ExternalLink className="w-3 h-3 text-stone-400" />
              </Link>

              {!isCoreStudioPage && (
                <button
                  type="button"
                  onClick={() => handleDeletePage(currentPage.id)}
                  className="p-2 rounded-xl bg-white hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-300 hover:border-red-300 transition-colors cursor-pointer shadow-xs"
                  title="Delete this page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveCurrentPage}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Content Fields */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* General Settings Card */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-4 text-xs">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <h3 className="font-serif font-bold text-stone-900 text-base">Page Content & Live Headings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-semibold">Page Title</label>
                    <input
                      type="text"
                      value={currentPage.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-sm font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-semibold">
                      URL Slug {isCoreStudioPage && "(Core System Identifier)"}
                    </label>
                    <input
                      type="text"
                      value={currentPage.slug}
                      disabled={isCoreStudioPage}
                      onChange={(e) => handleFieldChange("slug", e.target.value)}
                      className={`p-3 rounded-xl border font-mono text-xs ${
                        isCoreStudioPage
                          ? "bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed"
                          : "bg-stone-50 text-stone-900 border-stone-200 focus:outline-none focus:border-stone-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Main Headline */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-stone-800 font-semibold">Main Headline (H1)</label>
                    <span className="text-[10px] text-stone-400">Rendered in large luxury serif on the page</span>
                  </div>
                  <input
                    type="text"
                    value={currentPage.heading}
                    onChange={(e) => handleFieldChange("heading", e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 font-serif font-bold text-base"
                    placeholder="e.g. AI Mosaic Studio"
                  />
                </div>

                {/* Editorial Body Text */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-stone-800 font-semibold">Editorial Subtitle / Description</label>
                    <span className="text-[10px] text-stone-400">Rendered beneath the main headline</span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentPage.bodyText}
                    onChange={(e) => handleFieldChange("bodyText", e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 resize-none leading-relaxed text-xs"
                    placeholder="e.g. Upload a photo of your space — see a bespoke mosaic rendered into it."
                  />
                </div>

                {/* Category Badge / Kicker Text */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-stone-800 font-semibold">Category Badge / Kicker Text</label>
                    <span className="text-[10px] text-stone-400">Uppercase pill badge displayed above the headline</span>
                  </div>
                  <input
                    type="text"
                    value={currentPage.secondaryText || ""}
                    onChange={(e) => handleFieldChange("secondaryText", e.target.value)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 font-mono uppercase text-xs tracking-wider"
                    placeholder="e.g. CUSTOMIZE YOUR SPACE, IMAGINE FROM SCRATCH, FIND YOUR AESTHETIC"
                  />
                </div>
              </div>

              {/* Showcase Mosaic Catalog Grid */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-4 text-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Mosaic Pieces to Showcase at Bottom of Page
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Check which catalog references will appear in the curated bottom showcase grid on this page.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs self-start sm:self-auto font-semibold">
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
                        className={`group relative rounded-2xl bg-white border overflow-hidden cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? "border-stone-900 ring-2 ring-stone-900/10 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="relative aspect-square w-full bg-stone-100">
                          <Image src={prod.sampleImageUrl} alt={prod.title} fill className="object-cover" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-stone-900 text-white flex items-center gap-1 font-bold text-[10px] shadow">
                              <Check className="w-3 h-3" /> #{selectedIndex + 1}
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-0.5">
                          <span className="font-serif font-bold text-stone-900 truncate text-xs">{prod.title}</span>
                          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                            <span className="text-amber-800 font-bold">${prod.pricePerSqFt}/sq.ft</span>
                            <span className="truncate max-w-[70px]">{prod.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Live Preview & Hero Image Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Live Preview Card */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                    Frontend Live Preview
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Rendered Preview Mockup */}
                <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 text-center flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
                    {currentPage.secondaryText || "CATEGORY BADGE"}
                  </span>
                  <h4 className="text-lg font-serif italic text-stone-900 font-normal leading-tight">
                    {currentPage.heading || "Page Headline"}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed font-light">
                    {currentPage.bodyText || "Page description and subtitle..."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrentPage}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>

                  <Link
                    href={getLivePageUrl(currentPage.slug)}
                    target="_blank"
                    className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View on Live Site
                  </Link>
                </div>
              </div>

              {/* Hero Image Card */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-stone-600" />
                    <h4 className="font-serif font-bold text-stone-900 text-sm">Hero Image</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600">• WebP optimized</span>
                </div>

                {/* Thumbnail Preview */}
                <div className="relative aspect-[16/9] w-full rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shadow-2xs">
                  {currentPage.heroImageUrl ? (
                    <Image
                      src={currentPage.heroImageUrl}
                      alt={currentPage.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
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
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
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
                  <label className="text-stone-600 font-medium text-[11px]">Hero Image URL</label>
                  <input
                    type="text"
                    value={currentPage.heroImageUrl || ""}
                    onChange={(e) => handleFieldChange("heroImageUrl", e.target.value)}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-[11px] focus:outline-none focus:border-stone-900"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-stone-400">
          No pages found. Click "Add New Page" to create your first page.
        </div>
      )}
    </div>
  );
}
