"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ExternalLink, Grid, Layers, Compass } from "lucide-react";

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  templateType: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string | null;
  secondaryText?: string | null;
  updatedAt: Date | string;
}

export function PagesManagerClient({ initialPages }: { initialPages: PageRecord[] }) {
  const [pages, setPages] = useState<PageRecord[]>(initialPages);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dynamic page?")) return;

    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPages(pages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Error deleting page.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-neutral-400">Total Active Pages: {pages.length}</span>
        <Link
          href="/nextjs-app/pages/new"
          className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20 scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-obsidian-950" /> Create Dynamic Page
        </Link>
      </div>

      {/* Pages List Table */}
      <div className="w-full rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Page Title & Slug</th>
                <th className="p-4">Template Layout</th>
                <th className="p-4">Headline</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {pages.map((pg) => (
                <tr key={pg.id} className="hover:bg-obsidian-800/50 transition-colors">
                  <td className="p-4">
                    <span className="font-serif font-bold text-white block">{pg.title}</span>
                    <span className="text-[11px] text-gold-400 font-mono">/{pg.slug}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/20 font-mono text-[11px] uppercase font-bold inline-flex items-center gap-1.5">
                      {pg.templateType === "classic_grid" && <Grid className="w-3 h-3" />}
                      {pg.templateType === "hero_showcase" && <Layers className="w-3 h-3" />}
                      {pg.templateType === "split_gallery" && <Compass className="w-3 h-3" />}
                      {pg.templateType}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300 font-medium max-w-xs truncate">{pg.heading}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${pg.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-obsidian-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/nextjs-app/pages/edit/${pg.id}`}
                        className="p-2 rounded-lg bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Edit Page"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pg.id)}
                        className="p-2 rounded-lg bg-obsidian-800 hover:bg-red-950/40 text-red-400 transition-colors"
                        title="Delete Page"
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
    </div>
  );
}
