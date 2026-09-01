"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Check, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  sampleImageUrl: string;
  pricePerSqFt: number;
  specs: string;
}

export function ProductsManagerClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Marble Medallion");
  const [sampleImageUrl, setSampleImageUrl] = useState("");
  const [pricePerSqFt, setPricePerSqFt] = useState<number | string>(125);
  const [material, setMaterial] = useState("Italian Marble");
  const [finish, setFinish] = useState("Polished");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("Marble Medallion");
    setSampleImageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80");
    setPricePerSqFt(135);
    setMaterial("Calacatta Gold Marble");
    setFinish("Polished & Honed");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSlug(prod.slug);
    setDescription(prod.description);
    setCategory(prod.category);
    setSampleImageUrl(prod.sampleImageUrl);
    setPricePerSqFt(prod.pricePerSqFt);

    try {
      const parsed = JSON.parse(prod.specs);
      setMaterial(parsed.material || "Marble");
      setFinish(parsed.finish || "Polished");
    } catch (e) {
      setMaterial("Marble");
      setFinish("Polished");
    }

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const specsJson = JSON.stringify({ material, finish, groutWidth: "1/16\"" });

    try {
      const isEdit = !!editingProduct;
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct?.id,
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
        setProducts(products.map((p) => (p.id === editingProduct.id ? data.product : p)));
      } else {
        setProducts([data.product, ...products]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Error deleting product.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-neutral-400">Total Products: {products.length}</span>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
        >
          <Plus className="w-4 h-4" /> Add Mosaic Product
        </button>
      </div>

      {/* CRUD Table */}
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / sq.ft</th>
                <th className="p-4">Material Specs</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-obsidian-800/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                      <Image src={prod.sampleImageUrl} alt={prod.title} fill className="object-cover" />
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
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-lg bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 rounded-lg bg-obsidian-800 hover:bg-red-950/40 text-red-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {editingProduct ? "Edit Product" : "Add New Mosaic Product"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                  >
                    <option value="Marble Medallion">Marble Medallion</option>
                    <option value="Waterjet Accent">Waterjet Accent</option>
                    <option value="Glass Mosaic">Glass Mosaic</option>
                    <option value="Pool Inlay">Pool Inlay</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Price / sq.ft ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pricePerSqFt}
                    onChange={(e) => setPricePerSqFt(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-medium">Sample Image URL</label>
                <input
                  type="url"
                  required
                  value={sampleImageUrl}
                  onChange={(e) => setSampleImageUrl(e.target.value)}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-medium">Finish</label>
                  <input
                    type="text"
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-white resize-none"
                />
              </div>

              {error && <div className="p-2.5 bg-red-950/40 text-red-300 rounded-lg border border-red-500/20">{error}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
