"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Search,
  Filter,
  Palette,
  Compass,
  ExternalLink,
  Copy,
  Tag,
  SlidersHorizontal,
  Download,
  Maximize2,
  UserCheck,
  CheckSquare,
  Square,
  Mail,
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
  showOnCustomize?: boolean;
  showOnFromScratch?: boolean;
  isTrashed?: boolean;
  trashedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface QuizSubmission {
  id: string;
  userEmail?: string | null;
  style: string;
  shape: string;
  color: string;
  space: string;
  generatedPrompt: string;
  resultImageUrl?: string | null;
  generationId?: string | null;
  createdAt: string;
}

interface DeleteTarget {
  product: Product;
  mode: "active" | "trash";
}

interface ParsedSpecs {
  material: string;
  finish: string;
  style: string;
  space: string;
  shape: string;
  color: string;
  showOnFinder: boolean;
  [key: string]: any;
}

const AESTHETIC_STYLES = [
  "Abstract",
  "Geometric",
  "Floral",
  "Landscape",
  "Portrait",
  "Animal",
];

const SPACE_PLACEMENTS = [
  "Wall",
  "Floor",
  "Pool",
  "Backsplash",
  "Lobby",
  "Outdoor",
];

const COLOR_STORIES = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Blue",
  "Teal",
  "Green",
  "Purple",
  "Pink / Coral",
  "Yellow",
  "Earth / Terracotta",
  "Multicolor",
];

const SHAPES = [
  "Rectangular landscape",
  "Round",
  "Square",
  "Rectangular portrait",
  "No preference",
];

function parseProductSpecs(specsStr: string | null | undefined): ParsedSpecs {
  const defaults: ParsedSpecs = {
    material: "Italian Marble",
    finish: "Polished & Honed",
    style: "Geometric",
    space: "Wall",
    shape: "Square",
    color: "Gold",
    showOnFinder: true,
  };

  if (!specsStr) return defaults;
  try {
    const parsed = JSON.parse(specsStr);
    return {
      ...defaults,
      ...parsed,
      material: parsed.material || defaults.material,
      finish: parsed.finish || defaults.finish,
      style: parsed.style || parsed.aestheticStyle || defaults.style,
      space: parsed.space || parsed.application || defaults.space,
      shape: parsed.shape || defaults.shape,
      color: parsed.color || defaults.color,
      showOnFinder: parsed.showOnFinder !== undefined ? Boolean(parsed.showOnFinder) : true,
    };
  } catch {
    return defaults;
  }
}

export function ProductsManagerClient({
  initialProducts,
  initialSubmissions = [],
}: {
  initialProducts: Product[];
  initialSubmissions?: QuizSubmission[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>(
    initialSubmissions.filter((s) => Boolean(s.resultImageUrl))
  );
  const [activeTab, setActiveTab] = useState<"active" | "trash" | "submissions">("active");

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState("all");

  // Submissions State, Lightbox & Search
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [isDeletingSubmission, setIsDeletingSubmission] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilterStyle, setSubmissionFilterStyle] = useState("all");
  const [submissionLightbox, setSubmissionLightbox] = useState<QuizSubmission | null>(null);

  // Filtered submissions list (only completed generations)
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (!sub.resultImageUrl) return false;
      const q = submissionSearch.trim().toLowerCase();
      const matchesQ =
        !q ||
        (sub.userEmail && sub.userEmail.toLowerCase().includes(q)) ||
        (sub.generatedPrompt && sub.generatedPrompt.toLowerCase().includes(q)) ||
        (sub.style && sub.style.toLowerCase().includes(q)) ||
        (sub.space && sub.space.toLowerCase().includes(q)) ||
        (sub.color && sub.color.toLowerCase().includes(q)) ||
        (sub.shape && sub.shape.toLowerCase().includes(q));

      const matchesStyle =
        submissionFilterStyle === "all" ||
        sub.style?.toLowerCase() === submissionFilterStyle.toLowerCase();

      return matchesQ && matchesStyle;
    });
  }, [submissions, submissionSearch, submissionFilterStyle]);

  // Handle single submission delete
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this finder quiz submission?")) return;
    try {
      setIsDeletingSubmission(true);
      const res = await fetch(`/api/finder/result?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete quiz submission");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setSelectedSubmissions((prev) => prev.filter((i) => i !== id));
      if (submissionLightbox?.id === id) setSubmissionLightbox(null);
      showToast("Submission deleted successfully");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete submission");
    } finally {
      setIsDeletingSubmission(false);
    }
  };

  // Handle bulk submission delete
  const handleBulkDeleteSubmissions = async () => {
    if (selectedSubmissions.length === 0) return;
    if (!window.confirm(`Delete ${selectedSubmissions.length} selected quiz submissions?`)) return;
    try {
      setIsDeletingSubmission(true);
      const res = await fetch(`/api/finder/result?ids=${encodeURIComponent(selectedSubmissions.join(","))}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete quiz submissions");
      setSubmissions((prev) => prev.filter((s) => !selectedSubmissions.includes(s.id)));
      setSelectedSubmissions([]);
      showToast(`${selectedSubmissions.length} submissions removed`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete submissions");
    } finally {
      setIsDeletingSubmission(false);
    }
  };

  // Handle clear all submissions
  const handleClearAllSubmissions = async () => {
    if (!window.confirm("Are you sure you want to clear all finder quiz submissions? This cannot be undone.")) return;
    try {
      setIsDeletingSubmission(true);
      const res = await fetch("/api/finder/result?action=clear-all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear submissions");
      setSubmissions([]);
      setSelectedSubmissions([]);
      setSubmissionLightbox(null);
      showToast("All finder submissions cleared");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to clear submissions");
    } finally {
      setIsDeletingSubmission(false);
    }
  };

  // Handle direct image download
  const handleDownloadMosaic = async (url: string, filename?: string) => {
    try {
      showToast("Downloading mosaic preview...");
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || `bespoke-mosaic-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast("Download completed!");
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank");
    }
  };

  // Editor View: null = list view; "create" = new product; Product = edit
  const [editorState, setEditorState] = useState<"create" | Product | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Geometric");
  const [styleVal, setStyleVal] = useState("Geometric");
  const [spaceVal, setSpaceVal] = useState("Wall");
  const [colorVal, setColorVal] = useState("Gold");
  const [shapeVal, setShapeVal] = useState("Square");
  const [material, setMaterial] = useState("Calacatta Gold Marble");
  const [finish, setFinish] = useState("Polished & Honed");
  const [pricePerSqFt, setPricePerSqFt] = useState<number | string>(135);
  const [sampleImageUrl, setSampleImageUrl] = useState("");
  const [showOnFinder, setShowOnFinder] = useState<boolean>(true);
  const [showOnCustomize, setShowOnCustomize] = useState<boolean>(true);
  const [showOnFromScratch, setShowOnFromScratch] = useState<boolean>(true);

  // Image upload & media picker
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

  const activeProducts = useMemo(() => products.filter((p) => !p.isTrashed), [products]);
  const trashedProducts = useMemo(() => products.filter((p) => p.isTrashed), [products]);

  // Filtered active products based on search and style
  const filteredActiveProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const parsed = parseProductSpecs(p.specs);
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parsed.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parsed.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parsed.material.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStyle =
        filterStyle === "all" ||
        p.category.toLowerCase().includes(filterStyle.toLowerCase()) ||
        parsed.style.toLowerCase() === filterStyle.toLowerCase();

      return matchesSearch && matchesStyle;
    });
  }, [activeProducts, searchQuery, filterStyle]);

  // Bulk Selection Handlers
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
      showToast(`${selectedProductIds.length} products restored.`);
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

  // Open Create Form
  const handleOpenCreate = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("Geometric");
    setStyleVal("Geometric");
    setSpaceVal("Wall");
    setColorVal("Gold");
    setShapeVal("Square");
    setMaterial("Calacatta Gold Marble");
    setFinish("Polished & Honed");
    setPricePerSqFt(145);
    setSampleImageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80");
    setShowOnFinder(true);
    setShowOnCustomize(true);
    setShowOnFromScratch(true);
    setError(null);
    setUploadSuccessNote(null);
    setEditorState("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Edit Form
  const handleOpenEdit = (prod: Product) => {
    setTitle(prod.title);
    setSlug(prod.slug);
    setDescription(prod.description);
    setCategory(prod.category);
    setSampleImageUrl(prod.sampleImageUrl);
    setPricePerSqFt(prod.pricePerSqFt);
    setShowOnCustomize(prod.showOnCustomize !== false);
    setShowOnFromScratch(prod.showOnFromScratch !== false);

    const parsed = parseProductSpecs(prod.specs);
    setStyleVal(parsed.style || prod.category);
    setSpaceVal(parsed.space || "Wall");
    setColorVal(parsed.color || "Gold");
    setShapeVal(parsed.shape || "Square");
    setMaterial(parsed.material || "Calacatta Gold Marble");
    setFinish(parsed.finish || "Polished");
    setShowOnFinder(parsed.showOnFinder !== false);

    setError(null);
    setUploadSuccessNote(null);
    setEditorState(prod);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseEditor = () => {
    setEditorState(null);
    setError(null);
    setUploadSuccessNote(null);
  };

  // Image Upload via WebP API
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
      setUploadSuccessNote(`Optimized to WebP (saved ${data.savings?.savingsPercent || 0}% storage)!`);
      showToast("Image uploaded & WebP compressed!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open Media Picker
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

    const specsJson = JSON.stringify({
      material,
      finish,
      style: styleVal || category,
      space: spaceVal,
      color: colorVal,
      shape: shapeVal,
      showOnFinder,
    });

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
          category: category || styleVal,
          sampleImageUrl,
          pricePerSqFt: parseFloat(String(pricePerSqFt)),
          specs: specsJson,
          showOnCustomize,
          showOnFromScratch,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      if (isEdit) {
        setProducts(products.map((p) => (p.id === (editorState as Product).id ? { ...p, ...data.product } : p)));
        showToast(`Product "${title}" updated!`);
      } else {
        setProducts([data.product, ...products]);
        showToast(`Product "${title}" published!`);
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
      showToast("Product moved to Trash.");
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
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      setProducts(products.filter((p) => p.id !== id));
      setDeleteTarget(null);
      showToast("Product permanently deleted.");
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

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (!confirm("Permanently delete all items in the trash? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/nextjs-app/products?action=empty-trash`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to empty trash");

      setProducts(products.filter((p) => !p.isTrashed));
      showToast(`Trash emptied: ${data.count || 0} products deleted.`);
    } catch (err: any) {
      alert("Error emptying trash: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 border border-stone-800 text-white text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED FULL-SECTION PRODUCT EDITOR */}
      {/* ========================================================================= */}
      {editorState !== null ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Editor Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Catalog
              </button>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                  Product & Aesthetic Editor
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {editorState === "create" ? "Add New Mosaic Product" : `Edit: ${title || "Product"}`}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editorState === "create" ? "Publish Product" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Product Imagery Card */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-stone-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-base">Product Imagery</h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    WebP auto-optimized
                  </span>
                </div>

                {/* Upload & Media Options */}
                <div className="flex flex-col gap-3.5 text-xs">
                  <div className="p-5 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 hover:border-stone-400 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-200/80 flex items-center justify-center text-stone-700 shrink-0">
                        {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-serif font-bold text-stone-900 text-sm">Upload High-Res Mosaic Photo</p>
                        <p className="text-[11px] text-stone-500">
                          Auto-compressed and converted to high-performance WebP.
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
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        {isUploadingImage ? "Compressing..." : "Choose Image"}
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenMediaPicker}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Pick from existing Media Library"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-stone-600" /> Media Library
                      </button>
                    </div>
                  </div>

                  {uploadSuccessNote && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadSuccessNote}</span>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-medium flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-stone-400" /> Image URL or WebP Asset Path
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... or /uploads/example.webp"
                      value={sampleImageUrl}
                      onChange={(e) => setSampleImageUrl(e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* General Information & Aesthetic Style Card */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col gap-5">
                <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-stone-700" />
                  <h3 className="font-serif font-bold text-stone-900 text-base">Product Details & Aesthetic Style</h3>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-stone-700 font-medium">Product Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Riad Moroccan Zellige Tile Wall"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (editorState === "create") {
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                          }
                        }}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white text-sm font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-stone-700 font-medium">URL Slug (Identifier)</label>
                      <input
                        type="text"
                        required
                        placeholder="riad-moroccan-zellige-tile-wall"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Aesthetic Style / Category */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-stone-700 font-medium">
                        Aesthetic Style / Category (Used in Finder & Studio)
                      </label>
                      <span className="text-[10px] text-stone-500">Click a style or type below</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {AESTHETIC_STYLES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStyleVal(st);
                            setCategory(st);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            styleVal === st || category === st
                              ? "bg-stone-900 text-white font-semibold shadow-xs"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Geometric or Moroccan Zellige Wall"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setStyleVal(e.target.value);
                      }}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  {/* Surface Placement & Color Story */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-stone-700 font-medium">Surface Space / Placement</label>
                      <div className="flex flex-wrap gap-1">
                        {SPACE_PLACEMENTS.map((sp) => (
                          <button
                            key={sp}
                            type="button"
                            onClick={() => setSpaceVal(sp)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                              spaceVal === sp
                                ? "bg-stone-900 text-white font-semibold"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                            }`}
                          >
                            {sp}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={spaceVal}
                        onChange={(e) => setSpaceVal(e.target.value)}
                        placeholder="e.g. Backsplash or Wall"
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-stone-700 font-medium">Color Story / Palette</label>
                      <div className="flex flex-wrap gap-1">
                        {COLOR_STORIES.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setColorVal(col)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                              colorVal === col
                                ? "bg-stone-900 text-white font-semibold"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={colorVal}
                        onChange={(e) => setColorVal(e.target.value)}
                        placeholder="e.g. Gold & White or Emerald"
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Shape & Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-stone-700 font-medium">Geometric Composition / Shape</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SHAPES.map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => setShapeVal(sh)}
                          className={`px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                            shapeVal === sh
                              ? "bg-stone-900 text-white font-semibold"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                          }`}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-medium">Description & Craftsmanship Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the mosaic tesserae craftsmanship, surface aesthetic, and architectural application..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Material Specs & Pricing Card */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-700" />
                  <h3 className="font-serif font-bold text-stone-900 text-base">Material Specs & Pricing</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-medium">Price / sq.ft ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pricePerSqFt}
                      onChange={(e) => setPricePerSqFt(e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white font-mono text-sm font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-medium">Primary Material</label>
                    <input
                      type="text"
                      placeholder="e.g. Handmade Glazed Terracotta"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-stone-700 font-medium">Surface Finish</label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Chiseled Enamel"
                      value={finish}
                      onChange={(e) => setFinish(e.target.value)}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Channels (Post Object Targets) */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col gap-3.5 text-xs">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-stone-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-base">Studio Showcase Channels</h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Live Target Pages</span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Select where this mosaic piece is showcased automatically across the website:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={showOnFinder}
                      onChange={(e) => setShowOnFinder(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Aesthetic Finder</span>
                      <span className="text-[10px] font-mono text-stone-500">Quiz & Recommendations</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={showOnCustomize}
                      onChange={(e) => setShowOnCustomize(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Customize Space</span>
                      <span className="text-[10px] font-mono text-stone-500">Main Studio (/)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={showOnFromScratch}
                      onChange={(e) => setShowOnFromScratch(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Imagine From Scratch</span>
                      <span className="text-[10px] font-mono text-stone-500">Scratch Studio (/from-scratch)</span>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Live Preview Card Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="sticky top-6 p-6 rounded-3xl bg-white border border-stone-200 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-stone-700" />
                    <h4 className="font-serif font-bold text-stone-900 text-sm">Live Studio Preview</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-medium">
                    Catalog Card
                  </span>
                </div>

                {/* Card representation */}
                <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[4/3] w-full bg-stone-100">
                    {sampleImageUrl ? (
                      <Image
                        src={sampleImageUrl}
                        alt={title || "Product Preview"}
                        fill
                        className="object-cover"
                        unoptimized={sampleImageUrl.startsWith("data:")}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">No image uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 text-[11px] font-serif font-bold shadow-xs">
                      ${pricePerSqFt}/sq.ft
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-semibold">
                      {category || styleVal} • {spaceVal}
                    </span>
                    <h5 className="font-serif font-bold text-stone-900 text-base line-clamp-1">
                      {title || "Untitled Mosaic Product"}
                    </h5>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {description || "No description provided yet."}
                    </p>

                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>{material}</span>
                      <span>•</span>
                      <span>{finish}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editorState === "create" ? "Publish Mosaic Product" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditor}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-all cursor-pointer"
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
        /* 2. CATALOG LIST VIEW: ACTIVE PRODUCTS, TRASH, & QUIZ SUBMISSIONS TABS */
        /* ========================================================================= */
        <div className="flex flex-col gap-6">
          {/* Action & Status Tabs Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Active Products</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-200 text-stone-800">
                  {activeProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("trash")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "trash"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash Box</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-200 text-stone-800">
                  {trashedProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("submissions")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "submissions"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Finder Quiz Submissions</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-200 text-stone-800">
                  {submissions.length}
                </span>
              </button>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              {activeTab === "trash" && trashedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" /> Empty Trash Box
                </button>
              )}

              {activeTab === "submissions" && submissions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSubmissions}
                  disabled={isDeletingSubmission}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" /> Clear All Submissions
                </button>
              )}

              {activeTab === "active" && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Mosaic Product
                </button>
              )}
            </div>
          </div>

          {/* Search & Style Filter Toolbar for Active Products */}
          {activeTab === "active" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products by title, style, material, or surface placement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-stone-500 whitespace-nowrap hidden sm:inline">
                  Style:
                </span>
                <select
                  value={filterStyle}
                  onChange={(e) => setFilterStyle(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 font-medium focus:outline-none focus:border-stone-800 cursor-pointer"
                >
                  <option value="all">All Aesthetic Styles</option>
                  {AESTHETIC_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Bulk Action Toolbar */}
          {selectedProductIds.length > 0 && activeTab !== "submissions" && (
            <div className="p-3.5 px-5 rounded-2xl bg-stone-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
                  {selectedProductIds.length}
                </span>
                <span className="text-xs font-semibold">
                  {selectedProductIds.length} {selectedProductIds.length === 1 ? "product" : "products"} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="text-stone-300 hover:text-white text-xs underline cursor-pointer ml-1"
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
                      className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                    </button>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkPermanentDelete}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Selected
                    </button>
                    <button
                      type="button"
                      disabled={isBulkActing}
                      onClick={handleBulkPermanentDelete}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
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
            <div className="w-full rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
              {filteredActiveProducts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Layers className="w-12 h-12 text-stone-300" />
                  <p className="text-sm font-serif text-stone-600">
                    {searchQuery ? "No products matching your search query." : "No active mosaic products found."}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-2 px-4 py-2 rounded-xl bg-stone-900 text-white font-serif font-bold text-xs cursor-pointer"
                  >
                    Create First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-800 font-serif uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredActiveProducts.length > 0 &&
                              filteredActiveProducts.every((p) => selectedProductIds.includes(p.id))
                            }
                            onChange={() => handleSelectAll(filteredActiveProducts)}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-800 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Mosaic Design</th>
                        <th className="p-4">Aesthetic Style</th>
                        <th className="p-4">Surface Space</th>
                        <th className="p-4">Price / sq.ft</th>
                        <th className="p-4">Material Specs</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredActiveProducts.map((prod) => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        const parsed = parseProductSpecs(prod.specs);

                        return (
                          <tr
                            key={prod.id}
                            className={`hover:bg-stone-50/80 transition-colors ${
                              isSelected ? "bg-stone-100/70" : ""
                            }`}
                          >
                            <td className="p-4 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectProduct(prod.id)}
                                className="rounded border-stone-300 text-stone-900 focus:ring-stone-800 cursor-pointer"
                              />
                            </td>
                            <td className="p-4 flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
                                <Image
                                  src={prod.sampleImageUrl}
                                  alt={prod.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-serif font-bold text-stone-900 block leading-tight">
                                  {prod.title}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                                  {prod.slug}
                                </span>
                                <div className="flex items-center gap-1 mt-1">
                                  {parsed.showOnFinder !== false && (
                                    <span className="text-[9px] font-mono font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      Finder
                                    </span>
                                  )}
                                  {prod.showOnCustomize !== false && (
                                    <span className="text-[9px] font-mono font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      Customize
                                    </span>
                                  )}
                                  {prod.showOnFromScratch !== false && (
                                    <span className="text-[9px] font-mono font-medium text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                      Scratch
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800 font-medium text-[11px]">
                                {parsed.style || prod.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-stone-700 text-xs font-medium">
                                {parsed.space || "General"}
                              </span>
                            </td>
                            <td className="p-4 font-serif font-bold text-stone-900">
                              ${prod.pricePerSqFt}
                            </td>
                            <td className="p-4 text-[11px] text-stone-500 max-w-xs truncate">
                              {parsed.material} • {parsed.finish}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(prod)}
                                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ product: prod, mode: "active" })}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Move to Trash"
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
            <div className="w-full rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
              {trashedProducts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <FolderArchive className="w-12 h-12 text-stone-300" />
                  <p className="text-sm font-serif text-stone-600">Trash box is empty</p>
                  <p className="text-xs text-stone-400">
                    Products moved to trash can be restored or permanently removed here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-800 font-serif uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              trashedProducts.length > 0 &&
                              trashedProducts.every((p) => selectedProductIds.includes(p.id))
                            }
                            onChange={() => handleSelectAll(trashedProducts)}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-800 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Trashed Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Date Trashed</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {trashedProducts.map((prod) => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        return (
                          <tr
                            key={prod.id}
                            className={`hover:bg-stone-50/80 transition-colors opacity-90 ${
                              isSelected ? "bg-red-50/50" : ""
                            }`}
                          >
                            <td className="p-4 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectProduct(prod.id)}
                                className="rounded border-stone-300 text-stone-900 focus:ring-stone-800 cursor-pointer"
                              />
                            </td>
                            <td className="p-4 flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 grayscale">
                                <Image
                                  src={prod.sampleImageUrl}
                                  alt={prod.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-serif font-bold text-stone-800 block line-through">
                                  {prod.title}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">{prod.slug}</span>
                              </div>
                            </td>
                            <td className="p-4 text-stone-600">{prod.category}</td>
                            <td className="p-4 font-serif font-bold text-stone-700">${prod.pricePerSqFt}</td>
                            <td className="p-4 text-[11px] text-stone-500 font-mono">
                              {prod.trashedAt ? new Date(prod.trashedAt).toLocaleDateString() : "Recently"}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRestore(prod.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Restore to active catalog"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ product: prod, mode: "trash" })}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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

          {/* AESTHETIC QUIZ SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div className="flex flex-col gap-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    placeholder="Search submissions by email, prompt, aesthetic style, or surface..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors"
                  />
                  {submissionSearch && (
                    <button
                      type="button"
                      onClick={() => setSubmissionSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={submissionFilterStyle}
                      onChange={(e) => setSubmissionFilterStyle(e.target.value)}
                      className="pl-8 pr-7 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 cursor-pointer appearance-none"
                    >
                      <option value="all">All Styles</option>
                      {AESTHETIC_STYLES.map((st) => (
                        <option key={st} value={st.toLowerCase()}>
                          {st} Style
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-[11px] font-mono text-stone-500 whitespace-nowrap pl-1">
                    {filteredSubmissions.length} of {submissions.length} designs
                  </span>
                </div>
              </div>

              {/* Bulk Selection Toolbar */}
              {selectedSubmissions.length > 0 && (
                <div className="p-3.5 px-5 rounded-2xl bg-stone-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
                      {selectedSubmissions.length}
                    </span>
                    <span className="text-xs font-medium">
                      {selectedSubmissions.length === 1 ? "1 submission selected" : `${selectedSubmissions.length} submissions selected`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleBulkDeleteSubmissions}
                      disabled={isDeletingSubmission}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissions([])}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-all cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* Submissions Table */}
              <div className="w-full rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-14 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                      <Compass className="w-7 h-7" />
                    </div>
                    <p className="text-base font-serif font-semibold text-stone-800">
                      {submissions.length === 0
                        ? "No completed Finder Quiz generations yet"
                        : "No matching quiz generations found"}
                    </p>
                    <p className="text-xs text-stone-500 max-w-md leading-relaxed">
                      {submissions.length === 0
                        ? "Quiz results will automatically track and appear here once visitors run the AI synthesizer on /finder and completely render their bespoke mosaic designs."
                        : "Try adjusting your search query or aesthetic style filter."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-stone-50/80 text-stone-800 font-serif uppercase tracking-wider border-b border-stone-200 text-[11px]">
                        <tr>
                          <th className="p-4 w-10 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedSubmissions.length === filteredSubmissions.length) {
                                  setSelectedSubmissions([]);
                                } else {
                                  setSelectedSubmissions(filteredSubmissions.map((s) => s.id));
                                }
                              }}
                              className="text-stone-400 hover:text-stone-700"
                              title="Select / Deselect All"
                            >
                              {selectedSubmissions.length > 0 && selectedSubmissions.length === filteredSubmissions.length ? (
                                <CheckSquare className="w-4 h-4 text-stone-900" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-400" />
                              )}
                            </button>
                          </th>
                          <th className="p-4">Generated Mosaic</th>
                          <th className="p-4">Client User</th>
                          <th className="p-4">Aesthetic Specs</th>
                          <th className="p-4">Surface Placement</th>
                          <th className="p-4">Synthesis Prompt</th>
                          <th className="p-4">Date Rendered</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredSubmissions.map((sub) => {
                          const isSelected = selectedSubmissions.includes(sub.id);
                          return (
                            <tr
                              key={sub.id}
                              className={`transition-colors ${
                                isSelected ? "bg-stone-50" : "hover:bg-stone-50/70"
                              }`}
                            >
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedSubmissions((prev) => prev.filter((i) => i !== sub.id));
                                    } else {
                                      setSelectedSubmissions((prev) => [...prev, sub.id]);
                                    }
                                  }}
                                  className="text-stone-400 hover:text-stone-700"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-stone-900" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-400" />
                                  )}
                                </button>
                              </td>

                              {/* Thumbnail preview */}
                              <td className="p-4">
                                <div
                                  onClick={() => setSubmissionLightbox(sub)}
                                  className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group shadow-2xs hover:shadow-md transition-all shrink-0"
                                  title="Click to view full preview"
                                >
                                  {sub.resultImageUrl ? (
                                    <img
                                      src={sub.resultImageUrl}
                                      alt="Generated Mosaic"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              </td>

                              {/* Client user */}
                              <td className="p-4">
                                {sub.userEmail ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                      <span className="truncate max-w-[180px]">{sub.userEmail}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 w-fit">
                                      <UserCheck className="w-3 h-3 text-emerald-600" /> Verified Client
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-mono text-[10px] border border-stone-200">
                                    Guest Client
                                  </span>
                                )}
                              </td>

                              {/* Aesthetic specs */}
                              <td className="p-4">
                                <div className="flex items-center gap-1 flex-wrap max-w-xs">
                                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[10px] font-medium border border-stone-200 capitalize">
                                    {sub.style}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[10px] font-medium border border-stone-200 capitalize">
                                    {sub.color}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[10px] font-medium border border-stone-200 capitalize">
                                    {sub.shape}
                                  </span>
                                </div>
                              </td>

                              {/* Surface space */}
                              <td className="p-4">
                                <span className="font-serif font-medium text-stone-800 capitalize bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/80">
                                  {sub.space}
                                </span>
                              </td>

                              {/* Prompt */}
                              <td className="p-4 text-stone-600 max-w-xs">
                                <p
                                  className="line-clamp-2 text-[11px] leading-relaxed cursor-pointer hover:text-stone-900"
                                  onClick={() => setSubmissionLightbox(sub)}
                                  title={sub.generatedPrompt}
                                >
                                  {sub.generatedPrompt}
                                </p>
                              </td>

                              {/* Submission date */}
                              <td className="p-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                                {new Date(sub.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSubmissionLightbox(sub)}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                    title="View Full Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {sub.resultImageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadMosaic(sub.resultImageUrl!, `finder-mosaic-${sub.style}-${sub.id}.png`)}
                                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                      title="Download Mosaic Image"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(sub.generatedPrompt);
                                      showToast("Prompt copied to clipboard!");
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                    title="Copy Synthesis Prompt"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  <Link
                                    href={`/?mode=scratch&prompt=${encodeURIComponent(sub.generatedPrompt)}&placement=${encodeURIComponent(sub.space)}`}
                                    target="_blank"
                                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center justify-center"
                                    title="Open in AI Studio"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubmission(sub.id)}
                                    disabled={isDeletingSubmission}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                    title="Delete Submission"
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 SUBMISSION LIGHTBOX / DETAILS MODAL */}
      {/* ========================================================================= */}
      {submissionLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    Finder Mosaic Concept
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Synthesized {new Date(submissionLightbox.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionLightbox(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Mosaic Preview */}
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
                  {submissionLightbox.resultImageUrl ? (
                    <img
                      src={submissionLightbox.resultImageUrl}
                      alt="Mosaic Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {submissionLightbox.resultImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadMosaic(submissionLightbox.resultImageUrl!, `finder-mosaic-${submissionLightbox.id}.png`)}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download High-Res Image
                  </button>
                )}
              </div>

              {/* Specs & Prompt Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  {/* Client Email */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Client Account
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-medium text-stone-900 text-xs">
                        {submissionLightbox.userEmail || "Guest Client (Unverified)"}
                      </span>
                      {submissionLightbox.userEmail && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aesthetic DNA Tags */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Aesthetic DNA
                    </label>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 capitalize">
                        Style: {submissionLightbox.style}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 capitalize">
                        Color: {submissionLightbox.color}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 capitalize">
                        Shape: {submissionLightbox.shape}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-serif font-medium border border-amber-200 capitalize">
                        Space: {submissionLightbox.space}
                      </span>
                    </div>
                  </div>

                  {/* Synthesis Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Generated Synthesis Prompt
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(submissionLightbox.generatedPrompt);
                          showToast("Prompt copied!");
                        }}
                        className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed font-sans max-h-40 overflow-y-auto">
                      {submissionLightbox.generatedPrompt}
                    </div>
                  </div>
                </div>

                {/* Bottom Modal Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <Link
                    href={`/?mode=scratch&prompt=${encodeURIComponent(submissionLightbox.generatedPrompt)}&placement=${encodeURIComponent(submissionLightbox.space)}`}
                    target="_blank"
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-serif font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Open in AI Studio
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubmission(submissionLightbox.id)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    title="Delete Submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  {deleteTarget.mode === "active" ? "Delete Mosaic Product" : "Permanent Deletion"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-stone-700">
              <p className="line-clamp-2 italic text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                "{deleteTarget.product.title}"
              </p>
              <p className="text-stone-500 text-[11px]">
                {deleteTarget.mode === "active"
                  ? "Move this product to Trash Box (can be restored later), or delete it permanently from the database."
                  : "Are you sure? Permanent deletion cannot be undone."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {deleteTarget.mode === "active" ? (
                <>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleMoveToTrash(deleteTarget.product.id)}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                    Move to Trash
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handlePermanentDelete(deleteTarget.product.id)}
                    className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" /> Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handlePermanentDelete(deleteTarget.product.id)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Delete Forever
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MEDIA PICKER MODAL */}
      {/* ========================================================================= */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Select from Media Library</h3>
                <span className="text-[11px] text-stone-500">Choose an optimized WebP asset for this product</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {isLoadingMedia ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-stone-600 animate-spin" />
                </div>
              ) : mediaPickerList.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No images in Media Library yet. Upload images directly using the upload button above!
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaPickerList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectFromMedia(media.url)}
                      className="group relative aspect-square rounded-xl bg-stone-100 border border-stone-200 hover:border-stone-900 overflow-hidden cursor-pointer transition-all hover:scale-105"
                    >
                      <Image src={media.url} alt={media.filename} fill className="object-cover" />
                      <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2 py-1 rounded-md bg-white text-stone-900 text-[10px] font-bold shadow-xs">
                          Select
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs cursor-pointer"
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
