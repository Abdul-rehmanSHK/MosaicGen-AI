"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Sparkles,
  FolderArchive,
  Layers,
  Calendar,
  Eye,
  CheckCircle2,
} from "lucide-react";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  specs: string;
  isTrashed?: boolean;
  trashedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface DeleteTarget {
  product: Product;
  mode: "active" | "trash";
}

export function ProductsManagerClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");

  // View state: null = list view; "create" = new product; Product = edit product
  const [editorState, setEditorState] = useState<"create" | Product | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (targetProducts: Product[]) => {
    const targetIds = targetProducts.map((p) => p.id);
    const allSelected = targetIds.length > 0 && targetIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !targetIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...targetIds])));
    }
  };

  // Bulk Move to Trash
  const handleBulkTrash = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Move ${selectedProductIds.length} selected products to Trash?`)) return;
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds, action: "trash" }),
      });
      if (!res.ok) throw new Error("Failed to trash selected products");
      setProducts((prev) =>
        prev.map((p) =>
          selectedProductIds.includes(p.id)
            ? { ...p, isTrashed: true, trashedAt: new Date().toISOString() }
            : p
        )
      );
      showToast(`${selectedProductIds.length} products moved to Trash.`);
      setSelectedProductIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  // Bulk Restore
  const handleBulkRestore = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds, action: "restore" }),
      });
      if (!res.ok) throw new Error("Failed to restore selected products");
      setProducts((prev) =>
        prev.map((p) =>
          selectedProductIds.includes(p.id)
            ? { ...p, isTrashed: false, trashedAt: null }
            : p
        )
      );
      showToast(`${selectedProductIds.length} products restored to active catalog.`);
      setSelectedProductIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  // Bulk Permanent Delete
  const handleBulkPermanentDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (
      !confirm(
        `PERMANENT DELETION: Are you sure you want to permanently delete ${selectedProductIds.length} products from the database? This cannot be undone.`
      )
    ) {
      return;
    }
    setIsBulkActing(true);
    try {
      const res = await fetch("/api/nextjs-app/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds, permanent: true }),
      });
      if (!res.ok) throw new Error("Failed to permanently delete selected products");
      setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
      showToast(`${selectedProductIds.length} products deleted permanently.`);
      setSelectedProductIds([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Marble Medallion");
  const [sampleImageUrl, setSampleImageUrl] = useState("");
  const [pricePerSqFt, setPricePerSqFt] = useState<number | string>(125);
  const [material, setMaterial] = useState("Italian Marble");
  const [finish, setFinish] = useState("Polished");

  // Form image upload & media picker state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessNote, setUploadSuccessNote] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerList, setMediaPickerList] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeProducts = products.filter((p) => !p.isTrashed);
  const trashedProducts = products.filter((p) => p.isTrashed);

  // Open Create Section
  const handleOpenCreate = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("Marble Medallion");
    setSampleImageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80");
    setPricePerSqFt(135);
    setMaterial("Calacatta Gold Marble");
    setFinish("Polished & Honed");
    setError(null);
    setUploadSuccessNote(null);
    setEditorState("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Edit Section
  const handleOpenEdit = (prod: Product) => {
    setTitle(prod.title);
    setSlug(prod.slug);
    setDescription(prod.description);
    setCategory(prod.category);
    setSampleImageUrl(prod.sampleImageUrl);
    setPricePerSqFt(prod.pricePerSqFt);
    setError(null);
    setUploadSuccessNote(null);

    try {
      const parsed = JSON.parse(prod.specs);
      setMaterial(parsed.material || "Marble");
      setFinish(parsed.finish || "Polished");
    } catch (e) {
      setMaterial("Marble");
      setFinish("Polished");
    }

    setEditorState(prod);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseEditor = () => {
    setEditorState(null);
    setError(null);
    setUploadSuccessNote(null);
  };

  // Image Upload via sharp WebP API
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    setUploadSuccessNote(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/nextjs-app/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload and optimize image");

      setSampleImageUrl(data.media.url);
      setUploadSuccessNote(
        `Optimized & converted to WebP: saved ${data.savings?.savingsPercent || 0}% storage!`
      );
      showToast("Image uploaded & optimized to WebP!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open Media Picker Drawer
  const handleOpenMediaPicker = async () => {
    setIsMediaPickerOpen(true);
    setIsLoadingMedia(true);
    try {
      const res = await fetch("/api/nextjs-app/media");
      const data = await res.json();
      if (res.ok && data.media) {
        setMediaPickerList(data.media);
      }
    } catch (err) {
      console.error("Failed to load media list:", err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleSelectFromMedia = (url: string) => {
    setSampleImageUrl(url);
    setIsMediaPickerOpen(false);
    showToast("Media image selected!");
  };

  // Save product (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const specsJson = JSON.stringify({ material, finish, groutWidth: "1/16\"" });

    try {
      const isEdit = typeof editorState === "object" && editorState !== null;
      const url = "/api/nextjs-app/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEdit ? (editorState as Product).id : undefined,
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
          category,
          sampleImageUrl,
          pricePerSqFt,
          specs: specsJson,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      if (isEdit) {
        setProducts(products.map((p) => (p.id === (editorState as Product).id ? { ...p, ...data.product } : p)));
        showToast(`Product "${title}" updated successfully!`);
      } else {
        setProducts([data.product, ...products]);
        showToast(`Product "${title}" created successfully!`);
      }

      setEditorState(null);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soft Delete: Move to Trash
  const handleMoveToTrash = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/nextjs-app/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "trash" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to move to trash");

      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, isTrashed: true, trashedAt: new Date().toISOString() } : p
        )
      );

      setDeleteTarget(null);
      showToast("Product moved to Trash Box.");
    } catch (err: any) {
      alert("Error moving product to trash: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Hard Delete: Permanent DB Deletion
  const handlePermanentDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/nextjs-app/products?id=${id}&permanent=true`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to permanently delete product");

      setProducts(products.filter((p) => p.id !== id));
      setDeleteTarget(null);
      showToast("Product permanently deleted from database.");
    } catch (err: any) {
      alert("Error deleting product permanently: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Trashed Product
  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/nextjs-app/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "restore" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore product");

      setProducts(
        products.map((p) => (p.id === id ? { ...p, isTrashed: false, trashedAt: null } : p))
      );

      showToast("Product restored to active catalog!");
    } catch (err: any) {
      alert("Error restoring product: " + err.message);
    }
  };

  // Empty Trash (permanently delete all trashed items)
  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently delete all items in the trash? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/nextjs-app/products?action=empty-trash`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to empty trash");

      setProducts(products.filter((p) => !p.isTrashed));
      showToast(`Trash emptied: ${data.count || 0} products deleted permanently.`);
    } catch (err: any) {
      alert("Error emptying trash: " + err.message);
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
      {/* 1. DEDICATED FULL-SECTION PRODUCT EDITOR (REPLACES THE POPUP MODAL) */}
      {/* ========================================================================= */}
      {editorState !== null ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Editor Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-xl">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="p-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all flex items-center gap-2 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
              </button>
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">
                  Product Editor
                </span>
                <h2 className="text-xl font-serif font-bold text-white">
                  {editorState === "create" ? "Add New Mosaic Product" : `Edit: ${title || "Product"}`}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editorState === "create" ? "Publish Product" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Editor Form & Live Preview Grid */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Basic Information Card */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
                <div className="border-b border-neutral-800 pb-3 flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-gold-400" />
                  <h3 className="font-serif font-bold text-white text-base">General Information</h3>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Calacatta Celestial Medallion"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (editorState === "create") {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                        }
                      }}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-neutral-300 font-medium">URL Slug (Identifier)</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-neutral-300 font-medium">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="Marble Medallion">Marble Medallion</option>
                        <option value="Waterjet Accent">Waterjet Accent</option>
                        <option value="Glass Mosaic">Glass Mosaic</option>
                        <option value="Pool Inlay">Pool Inlay</option>
                        <option value="Accent Wall">Accent Wall</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the mosaic craftsmanship, surface aesthetic, and architectural application..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications & Pricing Card */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
                <div className="border-b border-neutral-800 pb-3 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <h3 className="font-serif font-bold text-white text-base">Material Specs & Pricing</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Price / sq.ft ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pricePerSqFt}
                      onChange={(e) => setPricePerSqFt(e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Primary Material</label>
                    <input
                      type="text"
                      placeholder="e.g. Calacatta Gold & Thassos Marble"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium">Surface Finish</label>
                    <input
                      type="text"
                      placeholder="e.g. Polished & Honed"
                      value={finish}
                      onChange={(e) => setFinish(e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>
              </div>

              {/* Product Imagery & Optimization Card */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
                <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-gold-400" />
                    <h3 className="font-serif font-bold text-white text-base">Sample Imagery</h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    • WebP auto-optimized
                  </span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* File Upload Zone */}
                  <div className="p-5 rounded-2xl bg-obsidian-950 border-2 border-dashed border-neutral-800 hover:border-gold-500/40 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                        {isUploadingImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-serif font-bold text-white text-sm">Upload Product Image</p>
                        <p className="text-[11px] text-neutral-400">
                          File will be automatically compressed and converted to modern WebP format.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        {isUploadingImage ? "Compressing..." : "Choose Image"}
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenMediaPicker}
                        className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs flex items-center gap-1.5 transition-all"
                        title="Pick from existing Media Library"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-gold-400" /> Media Library
                      </button>
                    </div>
                  </div>

                  {uploadSuccessNote && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{uploadSuccessNote}</span>
                    </div>
                  )}

                  {/* Manual URL Input (Fallback & External URLs) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-neutral-400" /> Sample Image URL or WebP Path
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... or /uploads/example.webp"
                      value={sampleImageUrl}
                      onChange={(e) => setSampleImageUrl(e.target.value)}
                      className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                    />
                    <span className="text-[10px] text-neutral-500">
                      You can paste an external URL (e.g. Unsplash) or upload a file above to auto-convert to WebP.
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Live Preview Card Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="sticky top-6 p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gold-400" />
                    <h4 className="font-serif font-bold text-white text-sm">Live Studio Preview</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono">
                    Catalog Card
                  </span>
                </div>

                {/* Card representation */}
                <div className="rounded-2xl bg-obsidian-950 border border-neutral-800 overflow-hidden shadow-lg flex flex-col">
                  <div className="relative aspect-[4/3] w-full bg-obsidian-900">
                    {sampleImageUrl ? (
                      <Image
                        src={sampleImageUrl}
                        alt={title || "Product Preview"}
                        fill
                        className="object-cover"
                        unoptimized={sampleImageUrl.startsWith("data:")}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">No image provided</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-gold-400 text-[11px] font-serif font-bold">
                      ${pricePerSqFt}/sq.ft
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400">
                      {category}
                    </span>
                    <h5 className="font-serif font-bold text-white text-base line-clamp-1">
                      {title || "Untitled Mosaic Product"}
                    </h5>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {description || "No description provided yet."}
                    </p>

                    <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>{material}</span>
                      <span className="text-neutral-500">•</span>
                      <span>{finish}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editorState === "create" ? "Publish Mosaic Product" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditor}
                    className="w-full py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs font-medium transition-all"
                  >
                    Cancel & Return
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. CATALOG LIST VIEW: ACTIVE PRODUCTS & TRASH BOX TABS */
        /* ========================================================================= */
        <div className="flex flex-col gap-6">
          {/* Action and Tabs Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-obsidian-900 border border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "active"
                    ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Active Products</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "active" ? "bg-obsidian-950 text-gold-300" : "bg-obsidian-800 text-neutral-300"
                  }`}
                >
                  {activeProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("trash")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "trash"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-obsidian-800"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash Box</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "trash" ? "bg-obsidian-950 text-red-300" : "bg-obsidian-800 text-neutral-300"
                  }`}
                >
                  {trashedProducts.length}
                </span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {activeTab === "trash" && trashedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" /> Empty Trash Box
                </button>
              )}

              {activeTab === "active" && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Mosaic Product
                </button>
              )}
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          {selectedProductIds.length > 0 && (
            <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 font-mono font-bold text-xs flex items-center justify-center">
                  {selectedProductIds.length}
                </span>
                <span className="text-xs font-semibold text-white">
                  {selectedProductIds.length} {selectedProductIds.length === 1 ? "product" : "products"} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="text-neutral-400 hover:text-white text-xs underline cursor-pointer ml-1"
                >
                  Deselect all
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeTab === "active" ? (
                  <>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkTrash}
                      className="px-3.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-amber-950/40 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                    </button>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkPermanentDelete}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkRestore}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Selected
                    </button>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkPermanentDelete}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE PRODUCTS TABLE */}
          {activeTab === "active" && (
            <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
              {activeProducts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Layers className="w-12 h-12 text-neutral-600" />
                  <p className="text-sm font-serif text-neutral-400">No active mosaic products</p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-2 px-4 py-2 rounded-xl bg-gold-500 text-obsidian-950 font-serif font-bold text-xs"
                  >
                    Create First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={activeProducts.length > 0 && activeProducts.every((p) => selectedProductIds.includes(p.id))}
                            onChange={() => handleSelectAll(activeProducts)}
                            className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price / sq.ft</th>
                        <th className="p-4">Material Specs</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {activeProducts.map((prod) => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        return (
                          <tr key={prod.id} className={`hover:bg-obsidian-800/50 transition-colors ${isSelected ? "bg-gold-500/5" : ""}`}>
                            <td className="p-4 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectProduct(prod.id)}
                                className="rounded border-neutral-700 text-gold-500 focus:ring-gold-400 cursor-pointer"
                              />
                            </td>
                            <td className="p-4 flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0 bg-obsidian-950">
                                <Image
                                  src={prod.sampleImageUrl}
                                  alt={prod.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-serif font-bold text-white block">{prod.title}</span>
                                <span className="text-[10px] text-neutral-500 font-mono">{prod.slug}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-gold-300">{prod.category}</td>
                            <td className="p-4 font-serif font-bold text-white">${prod.pricePerSqFt}</td>
                            <td className="p-4 text-[11px] text-neutral-400 max-w-xs truncate">{prod.specs}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(prod)}
                                  className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-neutral-700/50 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                                  title="Edit Product in Dedicated Section"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ product: prod, mode: "active" })}
                                  className="p-2 rounded-lg bg-obsidian-800 hover:bg-red-950/40 text-red-400 border border-neutral-700/50 transition-colors cursor-pointer"
                                  title="Delete or Move to Trash"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TRASH BOX TABLE */}
          {activeTab === "trash" && (
            <div className="w-full rounded-2xl bg-obsidian-900 border border-red-500/20 overflow-hidden shadow-xl">
              {trashedProducts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <FolderArchive className="w-12 h-12 text-neutral-600" />
                  <p className="text-sm font-serif text-neutral-400">Trash box is empty</p>
                  <p className="text-xs text-neutral-500">
                    Products moved to trash will appear here where they can be restored or permanently removed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-obsidian-950 text-red-300 font-serif uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={trashedProducts.length > 0 && trashedProducts.every((p) => selectedProductIds.includes(p.id))}
                            onChange={() => handleSelectAll(trashedProducts)}
                            className="rounded border-neutral-700 text-red-500 focus:ring-red-400 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Trashed Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Date Trashed</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {trashedProducts.map((prod) => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        return (
                          <tr key={prod.id} className={`hover:bg-obsidian-800/40 transition-colors opacity-90 ${isSelected ? "bg-red-500/10" : ""}`}>
                            <td className="p-4 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectProduct(prod.id)}
                                className="rounded border-neutral-700 text-red-500 focus:ring-red-400 cursor-pointer"
                              />
                            </td>
                            <td className="p-4 flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0 bg-obsidian-950 grayscale">
                                <Image
                                  src={prod.sampleImageUrl}
                                  alt={prod.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-serif font-bold text-white block line-through decoration-red-500/50">
                                  {prod.title}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono">{prod.slug}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-neutral-400">{prod.category}</td>
                            <td className="p-4 font-serif font-bold text-neutral-300">${prod.pricePerSqFt}</td>
                            <td className="p-4 text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              {prod.trashedAt ? new Date(prod.trashedAt).toLocaleDateString() : "Recently"}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRestore(prod.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Restore product to active catalog"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ product: prod, mode: "trash" })}
                                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Permanently delete from database"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL (CHOOSE: MOVE TO TRASH OR PERMANENT DELETE) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-white text-base">
                  {deleteTarget.mode === "active" ? "Delete Mosaic Product" : "Permanent Deletion"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-neutral-300">
              <p>
                You are about to delete <strong className="text-white">"{deleteTarget.product.title}"</strong>.
              </p>
              {deleteTarget.mode === "active" ? (
                <p className="text-neutral-400">
                  You can move it to the <strong className="text-gold-300">Trash Box</strong> where it can be restored anytime, or choose to <strong className="text-red-400">Delete Permanently</strong> from the database.
                </p>
              ) : (
                <p className="text-red-400">
                  This will permanently delete this product from the database. This action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {deleteTarget.mode === "active" ? (
                <>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleMoveToTrash(deleteTarget.product.id)}
                    className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                    Move to Trash Box (Can Restore)
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handlePermanentDelete(deleteTarget.product.id)}
                    className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" /> Delete Permanently from Database
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handlePermanentDelete(deleteTarget.product.id)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Permanent Delete
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-400 hover:text-white text-xs font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MEDIA PICKER MODAL (PICK FROM EXISTING MEDIA LIBRARY) */}
      {/* ========================================================================= */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-white text-base">Select from Media Library</h3>
                <span className="text-[11px] text-neutral-400">Choose an optimized WebP asset for this product</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {isLoadingMedia ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                </div>
              ) : mediaPickerList.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 text-xs">
                  No images in Media Library yet. Upload files directly using the upload button!
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaPickerList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectFromMedia(media.url)}
                      className="group relative aspect-square rounded-xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/80 overflow-hidden cursor-pointer transition-all hover:scale-105"
                    >
                      <Image src={media.url} alt={media.filename} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2 py-1 rounded-md bg-obsidian-950/90 text-gold-400 text-[10px] font-bold">
                          Select
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-800 bg-obsidian-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
