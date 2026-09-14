"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Layout,
  Sliders,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  RotateCcw,
  Palette,
} from "lucide-react";
import { SiteAppearanceData, MenuLinkItem, DEFAULT_HEADER_MENU, DEFAULT_FOOTER_LINKS } from "@/lib/appearance";

export function AppearanceManagerClient({
  initialAppearance,
}: {
  initialAppearance: SiteAppearanceData;
}) {
  const [appearance, setAppearance] = useState<SiteAppearanceData>(initialAppearance);
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parse Header and Footer Menu links
  const [headerLinks, setHeaderLinks] = useState<MenuLinkItem[]>(() => {
    try {
      return JSON.parse(appearance.headerMenuJson || "[]");
    } catch {
      return DEFAULT_HEADER_MENU;
    }
  });

  const [footerLinks, setFooterLinks] = useState<MenuLinkItem[]>(() => {
    try {
      return JSON.parse(appearance.footerLinksJson || "[]");
    } catch {
      return DEFAULT_FOOTER_LINKS;
    }
  });

  // Parse social links
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(appearance.socialLinksJson || "{}");
    } catch {
      return { instagram: "", pinterest: "", linkedin: "" };
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload Logo via Media API (with auto WebP compression)
  const handleLogoUpload = async (file: File, type: "header" | "footer") => {
    const setUploading = type === "header" ? setIsUploadingHeader : setIsUploadingFooter;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/nextjs-app/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      const uploadedUrl = data.media.url;

      if (type === "header") {
        setAppearance((prev) => ({ ...prev, headerLogoUrl: uploadedUrl }));
      } else {
        setAppearance((prev) => ({ ...prev, footerLogoUrl: uploadedUrl }));
      }

      showToast(`Optimized WebP logo uploaded for ${type}!`);
    } catch (e: any) {
      alert(e.message || "Failed to upload logo image.");
    } finally {
      setUploading(false);
    }
  };

  // Header Menu Link Actions
  const handleAddHeaderLink = () => {
    setHeaderLinks([...headerLinks, { label: "New Link", url: "/", external: false }]);
  };

  const handleUpdateHeaderLink = (index: number, field: keyof MenuLinkItem, value: any) => {
    const updated = [...headerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setHeaderLinks(updated);
  };

  const handleRemoveHeaderLink = (index: number) => {
    setHeaderLinks(headerLinks.filter((_, i) => i !== index));
  };

  // Footer Menu Link Actions
  const handleAddFooterLink = () => {
    setFooterLinks([...footerLinks, { label: "New Link", url: "/", external: false }]);
  };

  const handleUpdateFooterLink = (index: number, field: keyof MenuLinkItem, value: any) => {
    const updated = [...footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooterLinks(updated);
  };

  const handleRemoveFooterLink = (index: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  };

  // Save Appearance Changes to Backend
  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...appearance,
        headerMenuJson: JSON.stringify(headerLinks),
        footerLinksJson: JSON.stringify(footerLinks),
        socialLinksJson: JSON.stringify(socialLinks),
      };

      const res = await fetch("/api/nextjs-app/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save appearance settings.");
      }

      const data = await res.json();
      setAppearance(data.appearance);
      showToast("Appearance & navigation settings saved successfully!");
    } catch (e: any) {
      alert(e.message || "Failed to save appearance settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-gold-500 text-obsidian-950 font-bold text-xs shadow-2xl flex items-center gap-3 border border-gold-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-obsidian-950" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Appearance & Navigation</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Customize header & footer brand names, upload custom studio logo images, and manage navigation menus.
          </p>
        </div>

        <button
          onClick={handleSaveAppearance}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Appearance"}
        </button>
      </div>

      {/* Navigation Switcher: Header vs Footer */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("header")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "header"
              ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
              : "bg-obsidian-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> Header & Top Navigation
        </button>

        <button
          onClick={() => setActiveTab("footer")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "footer"
              ? "bg-gold-500 text-obsidian-950 shadow-md shadow-gold-500/20"
              : "bg-obsidian-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Footer & Studio Information
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HEADER & TOP NAVIGATION SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "header" && (
        <div className="flex flex-col gap-8">
          {/* Section A: Header Brand & Logo */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-gold-400" /> Header Brand & Logo Graphic
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name & Tagline */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Studio Brand Name</label>
                  <input
                    type="text"
                    value={appearance.headerBrandName}
                    onChange={(e) => setAppearance({ ...appearance, headerBrandName: e.target.value })}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 font-serif font-bold"
                    placeholder="e.g. MEC AI MOSAIC"
                  />
                  <span className="text-[10px] text-neutral-500">Displayed in the header brand lockup.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Header Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={appearance.headerTagline}
                    onChange={(e) => setAppearance({ ...appearance, headerTagline: e.target.value })}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 font-mono"
                    placeholder="e.g. Bespoke Surface Studio"
                  />
                  <span className="text-[10px] text-neutral-500">Small uppercase subtitle below the brand name.</span>
                </div>
              </div>

              {/* Logo Graphic Upload / URL */}
              <div className="p-5 rounded-xl bg-obsidian-950 border border-gold-500/20 flex flex-col gap-4">
                <label className="text-xs font-semibold text-gold-300 flex items-center justify-between">
                  <span>Header Logo Image</span>
                  {appearance.headerLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, headerLogoUrl: null })}
                      className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert to "M" Monogram
                    </button>
                  )}
                </label>

                {/* Logo Live Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-obsidian-900 border border-gold-500/30 flex items-center justify-center overflow-hidden shrink-0">
                    {appearance.headerLogoUrl ? (
                      <Image
                        src={appearance.headerLogoUrl}
                        alt="Header Logo"
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-obsidian-950 font-serif font-bold text-xl shadow-md">
                        M
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">
                      {appearance.headerLogoUrl ? "Custom Logo Active" : "Default Gold Monogram 'M'"}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Upload transparent PNG, SVG, or WebP logo. Recommended height: 40px to 80px.
                    </span>
                  </div>
                </div>

                {/* Upload & URL Controls */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-4 py-2 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <UploadCloud className="w-3.5 h-3.5 text-gold-400" />
                      {isUploadingHeader ? "Compressing & Uploading..." : "Upload Logo File"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingHeader}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, "header");
                        }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. /uploads/logo.webp or https://...)"
                    value={appearance.headerLogoUrl || ""}
                    onChange={(e) => setAppearance({ ...appearance, headerLogoUrl: e.target.value || null })}
                    className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Header Navigation Menu Builder */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gold-400" /> Header Navigation Menu Items
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure the pills and links rendered in the public studio header.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddHeaderLink}
                className="px-3.5 py-1.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Menu Link
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {headerLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-6 h-6 rounded-full bg-obsidian-900 border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-gold-400 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Link Label (e.g. Customize your space)"
                      value={item.label}
                      onChange={(e) => handleUpdateHeaderLink(idx, "label", e.target.value)}
                      className="p-2 rounded-lg bg-obsidian-900 border border-neutral-700 text-xs text-white font-bold flex-1 focus:outline-none focus:border-gold-400"
                    />
                    <input
                      type="text"
                      placeholder="Target URL (e.g. / or /finder)"
                      value={item.url}
                      onChange={(e) => handleUpdateHeaderLink(idx, "url", e.target.value)}
                      className="p-2 rounded-lg bg-obsidian-900 border border-neutral-700 text-xs text-neutral-300 font-mono flex-1 focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!item.external}
                        onChange={(e) => handleUpdateHeaderLink(idx, "external", e.target.checked)}
                        className="rounded border-neutral-700 text-gold-500 focus:ring-0"
                      />
                      <span>Open New Tab</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveHeaderLink(idx)}
                      className="p-2 rounded-lg bg-obsidian-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition-all"
                      title="Remove Menu Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setHeaderLinks(DEFAULT_HEADER_MENU)}
                  className="text-xs text-neutral-500 hover:text-gold-300 flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to Default Header Navigation
                </button>
              </div>
            </div>
          </div>

          {/* Section C: Live Header Preview Box */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-gold-500/20 flex flex-col gap-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Header Preview Mockup
            </h3>

            <div className="p-4 rounded-2xl bg-obsidian-950 border border-gold-500/40 shadow-xl flex items-center justify-between overflow-x-auto">
              {/* Brand Logo in Preview */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-9 h-9 rounded-xl bg-obsidian-900 border border-gold-500/30 flex items-center justify-center overflow-hidden">
                  {appearance.headerLogoUrl ? (
                    <Image src={appearance.headerLogoUrl} alt="Logo" fill className="object-contain p-1" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-obsidian-950 font-serif font-bold text-base">
                      M
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-sm text-white">{appearance.headerBrandName}</span>
                  <span className="text-[9px] text-amber-400 font-mono tracking-widest uppercase">
                    {appearance.headerTagline}
                  </span>
                </div>
              </div>

              {/* Navigation Pills in Preview */}
              <div className="flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-gold-500/20 shrink-0">
                {headerLinks.map((link, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                      i === 0
                        ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm"
                        : "text-neutral-300"
                    }`}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-2.5 h-2.5" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FOOTER & STUDIO INFORMATION SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "footer" && (
        <div className="flex flex-col gap-8">
          {/* Section A: Footer Brand & Logo */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-gold-400" /> Footer Brand, Logo & Editorial Description
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Footer Brand Title</label>
                  <input
                    type="text"
                    value={appearance.footerBrandName}
                    onChange={(e) => setAppearance({ ...appearance, footerBrandName: e.target.value })}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 font-serif font-bold"
                    placeholder="e.g. MEC AI MOSAIC STUDIO"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Footer Brand Description</label>
                  <textarea
                    rows={4}
                    value={appearance.footerDescription}
                    onChange={(e) => setAppearance({ ...appearance, footerDescription: e.target.value })}
                    className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-gold-400"
                    placeholder="Pioneering luxury architectural surface design..."
                  />
                </div>
              </div>

              {/* Footer Logo Upload */}
              <div className="p-5 rounded-xl bg-obsidian-950 border border-gold-500/20 flex flex-col gap-4">
                <label className="text-xs font-semibold text-gold-300 flex items-center justify-between">
                  <span>Footer Logo Image</span>
                  {appearance.footerLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, footerLogoUrl: null })}
                      className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert to Default Monogram
                    </button>
                  )}
                </label>

                {/* Footer Logo Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-obsidian-900 border border-gold-500/30 flex items-center justify-center overflow-hidden shrink-0">
                    {appearance.footerLogoUrl ? (
                      <Image
                        src={appearance.footerLogoUrl}
                        alt="Footer Logo"
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-obsidian-900 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-lg">
                        M
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">
                      {appearance.footerLogoUrl ? "Custom Footer Logo Active" : "Default Obsidian Monogram"}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Upload transparent PNG, SVG, or WebP logo image for the footer.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
                  <label className="px-4 py-2 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <UploadCloud className="w-3.5 h-3.5 text-gold-400" />
                    {isUploadingFooter ? "Compressing & Uploading..." : "Upload Footer Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingFooter}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file, "footer");
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. /uploads/footer-logo.webp)"
                    value={appearance.footerLogoUrl || ""}
                    onChange={(e) => setAppearance({ ...appearance, footerLogoUrl: e.target.value || null })}
                    className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Studio Contact & Location Info */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <MapPin className="w-4 h-4 text-gold-400" /> Studio Contact & Showroom Locations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold-400" /> Concierge Email
                </label>
                <input
                  type="email"
                  value={appearance.footerContactEmail || ""}
                  onChange={(e) => setAppearance({ ...appearance, footerContactEmail: e.target.value || null })}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  placeholder="concierge@mecartworks.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold-400" /> Phone Contact
                </label>
                <input
                  type="text"
                  value={appearance.footerContactPhone || ""}
                  onChange={(e) => setAppearance({ ...appearance, footerContactPhone: e.target.value || null })}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  placeholder="+1 (800) 555-MOSAIC"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" /> Studio Locations
                </label>
                <input
                  type="text"
                  value={appearance.footerAddress || ""}
                  onChange={(e) => setAppearance({ ...appearance, footerAddress: e.target.value || null })}
                  className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400"
                  placeholder="Carrara, Italy & NY, USA"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-neutral-300">Copyright Notice & Legal Line</label>
              <input
                type="text"
                value={appearance.footerCopyright}
                onChange={(e) => setAppearance({ ...appearance, footerCopyright: e.target.value })}
                className="p-2.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 font-mono"
                placeholder="© 2026 MEC Artworks Studio. All Rights Reserved."
              />
            </div>
          </div>

          {/* Section C: Footer Navigation Menu Items */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gold-400" /> Footer Navigation Column Links
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure the links that appear in the Footer Navigation column.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFooterLink}
                className="px-3.5 py-1.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Footer Link
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {footerLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-6 h-6 rounded-full bg-obsidian-900 border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-gold-400 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Link Label"
                      value={item.label}
                      onChange={(e) => handleUpdateFooterLink(idx, "label", e.target.value)}
                      className="p-2 rounded-lg bg-obsidian-900 border border-neutral-700 text-xs text-white font-bold flex-1 focus:outline-none focus:border-gold-400"
                    />
                    <input
                      type="text"
                      placeholder="Target URL"
                      value={item.url}
                      onChange={(e) => handleUpdateFooterLink(idx, "url", e.target.value)}
                      className="p-2 rounded-lg bg-obsidian-900 border border-neutral-700 text-xs text-neutral-300 font-mono flex-1 focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!item.external}
                        onChange={(e) => handleUpdateFooterLink(idx, "external", e.target.checked)}
                        className="rounded border-neutral-700 text-gold-500 focus:ring-0"
                      />
                      <span>Open New Tab</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveFooterLink(idx)}
                      className="p-2 rounded-lg bg-obsidian-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
