"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Edit2, Trash2, Eye, X, Check, Loader2, Sparkles, Filter, Search } from "lucide-react";

interface Product {
  id: string;
  title: string;
}

interface GenerationRecord {
  id: string;
  prompt: string;
  placement: string;
  resultImageUrl: string;
  inputImageUrl?: string | null;
  maskUrl?: string | null;
  createdAt: Date | string;
  user?: { name?: string | null; email: string } | null;
  product?: Product | null;
}

interface GenerationsManagerClientProps {
  initialGenerations: GenerationRecord[];
  products: Product[];
}

const PLACEMENTS = [
  "All",
  "Floor Medallion",
  "Backsplash",
  "Accent Wall",
  "Pool",
  "Entryway",
];

export function GenerationsManagerClient({ initialGenerations, products }: GenerationsManagerClientProps) {
  const [generations, setGenerations] = useState<GenerationRecord[]>(initialGenerations);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlacement, setSelectedPlacement] = useState("All");

  const [inspectGen, setInspectGen] = useState<GenerationRecord | null>(null);
  const [editingGen, setEditingGen] = useState<GenerationRecord | null>(null);

  // Edit form state
  const [editPrompt, setEditPrompt] = useState("");
  const [editPlacement, setEditPlacement] = useState("");
  const [editProductId, setEditProductId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered generations
  const filteredGenerations = generations.filter((gen) => {
    const matchesPlacement = selectedPlacement === "All" || gen.placement === selectedPlacement;
    const matchesSearch =
      gen.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gen.user?.email && gen.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (gen.product?.title && gen.product.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlacement && matchesSearch;
  });

  const openEditModal = (gen: GenerationRecord) => {
    setEditingGen(gen);
    setEditPrompt(gen.prompt);
    setEditPlacement(gen.placement);
    setEditProductId(gen.product?.id || "");
    setError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGen) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGen.id,
          prompt: editPrompt,
          placement: editPlacement,
          productId: editProductId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setGenerations(generations.map((g) => (g.id === editingGen.id ? data.generation : g)));
      setEditingGen(null);
    } catch (err: any) {
      setError(err.message || "Failed to update generation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI generation record?")) return;

    try {
      const res = await fetch(`/api/admin/generations?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setGenerations(generations.filter((g) => g.id !== id));
      if (inspectGen?.id === id) setInspectGen(null);
    } catch (e) {
      alert("Error deleting generation record.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gold-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt, user email, or style..."
            className="w-full p-2 bg-transparent text-xs text-white focus:outline-none placeholder-neutral-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gold-400 mr-1" />
          {PLACEMENTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlacement(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPlacement === p
                  ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
                  : "bg-obsidian-950 text-neutral-300 hover:bg-obsidian-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Generations Grid */}
      {filteredGenerations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-obsidian-900 border border-neutral-800 text-neutral-400 text-xs">
          No AI generation records match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((gen) => (
            <div
              key={gen.id}
              className="group relative rounded-2xl bg-obsidian-900 border border-neutral-800 hover:border-gold-500/30 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="relative w-full h-56 bg-obsidian-950 overflow-hidden">
                <Image
                  src={gen.resultImageUrl}
                  alt={gen.prompt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[10px] font-mono uppercase font-bold">
                  {gen.placement}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <p className="text-xs font-semibold text-white line-clamp-2 leading-relaxed">
                  "{gen.prompt}"
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
                  <span className="truncate max-w-[150px]">
                    👤 {gen.user ? gen.user.name || gen.user.email : "Guest Client"}
                  </span>
                  <span className="font-mono text-neutral-500">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-neutral-800/50 mt-2">
                <button
                  type="button"
                  onClick={() => setInspectGen(gen)}
                  className="flex-1 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-gold-400" /> Inspect
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(gen)}
                  className="p-2 rounded-xl bg-obsidian-950 hover:bg-gold-500/20 text-gold-300 transition-colors"
                  title="Edit Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(gen.id)}
                  className="p-2 rounded-xl bg-obsidian-950 hover:bg-red-950/40 text-red-400 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold">
                  AI Generation Inspection
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">Surface Render Details</h3>
              </div>
              <button type="button" onClick={() => setInspectGen(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-gold-500/30 shadow-md">
                <Image src={inspectGen.resultImageUrl} alt="Render" fill className="object-cover" />
              </div>

              <div className="flex flex-col gap-4 text-xs text-neutral-300">
                <div className="p-4 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1">
                  <span className="text-gold-400 font-bold font-serif text-sm">Prompt Vision</span>
                  <p className="italic text-neutral-200">"{inspectGen.prompt}"</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-0.5">Placement</span>
                    <span className="font-bold text-white">{inspectGen.placement}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-0.5">Created Date</span>
                    <span className="font-bold text-white">{new Date(inspectGen.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-500">Client Account:</span>
                  <span className="font-bold text-gold-300">
                    {inspectGen.user ? inspectGen.user.email : "Guest Client"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  const g = inspectGen;
                  setInspectGen(null);
                  openEditModal(g);
                }}
                className="px-5 py-2.5 rounded-xl bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Record
              </button>
              <button
                type="button"
                onClick={() => handleDelete(inspectGen.id)}
                className="px-5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">Edit AI Generation</h3>
              <button type="button" onClick={() => setEditingGen(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-medium">Prompt</label>
                <textarea
                  rows={3}
                  required
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Placement</label>
                  <select
                    value={editPlacement}
                    onChange={(e) => setEditPlacement(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white"
                  >
                    {PLACEMENTS.filter((p) => p !== "All").map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Mosaic Style Reference</label>
                  <select
                    value={editProductId}
                    onChange={(e) => setEditProductId(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white"
                  >
                    <option value="">None (Custom)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="p-2.5 bg-red-950/40 text-red-300 rounded-lg border border-red-500/20">{error}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
