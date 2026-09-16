"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  RefreshCw,
  Database,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Loader2,
  Trash2,
  Sparkles,
  Server,
  Activity,
} from "lucide-react";

interface OptimizationMetrics {
  database: {
    totalProducts: number;
    trashedProducts: number;
    totalGenerations: number;
    trashedGenerations: number;
    totalInquiries: number;
    totalUsers: number;
    totalMedia: number;
    expiredOtpCodes: number;
    activePages: number;
    dbType: string;
  };
  cache: {
    activeTags: string[];
    revalidateStrategy: string;
    defaultTTLSeconds: number;
  };
  images: {
    formats: string[];
    edgeCacheTTLDays: number;
    remoteStorageProviders: string[];
  };
  minification: {
    compiler: string;
    jsMinified: boolean;
    cssChunksMinified: boolean;
    compression: string;
    serverActionsBodyLimit: string;
  };
}

export function OptimizationManagerClient() {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "System ready. Select an optimization task below or run full site optimization.",
  ]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastOptimizedAt, setLastOptimizedAt] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const res = await fetch("/api/nextjs-app/optimize");
      const data = await res.json();
      if (res.ok && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load optimization metrics:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const runOptimization = async (action: string, label: string) => {
    try {
      setExecutingAction(action);
      setStatusMessage(null);
      addLog(`Initiating: ${label}...`);

      const res = await fetch("/api/nextjs-app/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Operation failed.");
      }

      setStatusMessage(data.message || `${label} executed successfully.`);
      setLastOptimizedAt(new Date().toLocaleTimeString());

      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((logLine: string) => addLog(`[SUCCESS] ${logLine}`));
      } else {
        addLog(`[SUCCESS] ${label} completed.`);
      }

      // Refresh stats
      await fetchMetrics();
    } catch (err: any) {
      const errorMsg = err.message || "Failed to execute optimization.";
      setStatusMessage(`Error: ${errorMsg}`);
      addLog(`[ERROR] ${errorMsg}`);
    } finally {
      setExecutingAction(null);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Action Header */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-lg shadow-gold-500/10">
            <Zap className="w-7 h-7 animate-pulse text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-white">
                Site Performance & Cache Center
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              One-click cache invalidation, database vacuuming, asset optimization, and Next.js 15 build tuning.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchMetrics}
            disabled={isLoadingMetrics}
            className="px-4 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMetrics ? "animate-spin" : ""}`} />
            Refresh Metrics
          </button>

          <button
            type="button"
            disabled={Boolean(executingAction)}
            onClick={() => runOptimization("full_site_optimization", "Full Site Optimization")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-gold-500/20 cursor-pointer disabled:opacity-50"
          >
            {executingAction === "full_site_optimization" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Run Full Site Optimization
          </button>
        </div>
      </div>

      {/* Success/Error Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs animate-fadeIn ${
            statusMessage.startsWith("Error")
              ? "bg-red-950/50 border-red-500/40 text-red-200"
              : "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.startsWith("Error") ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-semibold">{statusMessage}</span>
          </div>
          {lastOptimizedAt && (
            <span className="text-[10px] font-mono opacity-80">Last run: {lastOptimizedAt}</span>
          )}
        </div>
      )}

      {/* Overview Cards (4 Grid Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Next.js 15 Tagged Caching Card */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Cache Architecture
            </span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-white">Next.js 15</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">
                Tagged Cache
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Active Tags: <strong className="text-white">products, pages</strong>
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            Default TTL: 3,600s (Auto revalidate)
          </span>
        </div>

        {/* 2. Database Health & Compaction */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Database Engine
            </span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-white">
                {metrics?.database ? metrics.database.totalProducts + metrics.database.totalGenerations : "..."}
              </span>
              <span className="text-[11px] text-neutral-400">active records</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Pending Expired OTPs:{" "}
              <strong className={metrics?.database.expiredOtpCodes ? "text-amber-400" : "text-emerald-400"}>
                {metrics?.database.expiredOtpCodes ?? 0}
              </strong>
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">PRAGMA optimize supported</span>
        </div>

        {/* 3. Image & Asset Engine */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Image Optimization
            </span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                AVIF
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                WebP
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              AWS S3 & Cloudflare R2 Connected
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">30-day Edge Cache TTL</span>
        </div>

        {/* 4. Minification & Compiler */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              JS / CSS Compression
            </span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-emerald-400">SWC Minified</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Tree-shaking & Gzip active</p>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Payload limit: 10MB</span>
        </div>
      </div>

      {/* Main Optimization Operations Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Action Panels (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Cache Control Hub */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-white text-base">Cache Invalidation Hub</h3>
              </div>
              <span className="text-[10px] font-mono text-gold-400">Instant on-demand</span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Flush the Next.js tagged cache so client visitors immediately receive the latest products, prices, and CMS layouts without rebuilding the site:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                disabled={Boolean(executingAction)}
                onClick={() => runOptimization("purge_products_cache", "Purge Products Catalog Cache")}
                className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 text-left transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white group-hover:text-gold-300 transition-colors">
                    Purge Products Cache
                  </span>
                  {executingAction === "purge_products_cache" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500 group-hover:text-gold-400 transition-colors" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Calls <code className="text-gold-400">revalidateTag(&apos;products&apos;)</code> to refresh catalog showcases and pricing instantly.
                </p>
              </button>

              <button
                type="button"
                disabled={Boolean(executingAction)}
                onClick={() => runOptimization("purge_pages_cache", "Purge Dynamic Pages Cache")}
                className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 hover:border-gold-500/40 text-left transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white group-hover:text-gold-300 transition-colors">
                    Purge CMS Pages Cache
                  </span>
                  {executingAction === "purge_pages_cache" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500 group-hover:text-gold-400 transition-colors" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Calls <code className="text-gold-400">revalidateTag(&apos;pages&apos;)</code> to update dynamic editorial page layouts.
                </p>
              </button>

              <button
                type="button"
                disabled={Boolean(executingAction)}
                onClick={() => runOptimization("purge_all_cache", "Purge All Site Caches")}
                className="sm:col-span-2 p-4 rounded-2xl bg-obsidian-950 border border-gold-500/20 hover:border-gold-500/50 text-left transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white group-hover:text-gold-300 transition-colors flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Purge All Site Caches & Refresh Paths
                  </span>
                  {executingAction === "purge_all_cache" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Invalidates all tags and triggers root layout path revalidation across the public site.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Database Housekeeping & Index Maintenance */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-white text-base">Database Compaction & Maintenance</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">SQLite + Prisma</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <span className="text-base font-serif font-bold text-white block">
                  {metrics?.database.totalProducts ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400">Catalog Items</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <span className="text-base font-serif font-bold text-white block">
                  {metrics?.database.totalGenerations ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400">AI Generations</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <span className="text-base font-serif font-bold text-white block">
                  {metrics?.database.totalMedia ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400">Media Files</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <span className="text-base font-serif font-bold text-amber-400 block">
                  {metrics?.database.expiredOtpCodes ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400">Expired OTPs</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-neutral-300">
                <p>Run query plan optimization (<code className="text-gold-400">PRAGMA optimize</code>) and delete expired authentication codes.</p>
              </div>

              <button
                type="button"
                disabled={Boolean(executingAction)}
                onClick={() => runOptimization("optimize_database", "Database Maintenance & Compaction")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-obsidian-800 hover:bg-gold-500/10 text-gold-300 hover:text-gold-200 border border-gold-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {executingAction === "optimize_database" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-gold-400" />
                )}
                Run Database Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Console & Engine Specs (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Activity Console */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif font-bold text-white text-base">Execution Activity Log</h3>
              </div>
              <button
                type="button"
                onClick={() => setLogs(["Log cleared."])}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono"
              >
                Clear
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black border border-neutral-800/80 font-mono text-[11px] text-emerald-300 max-h-72 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes("[ERROR]")
                      ? "text-red-400"
                      : log.includes("[SUCCESS]")
                      ? "text-emerald-300 font-semibold"
                      : "text-neutral-400"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Engine Architecture Summary Card */}
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Server className="w-4 h-4 text-gold-400" />
              <h4 className="font-serif font-bold text-white text-sm">Site Optimization Architecture</h4>
            </div>

            <div className="flex flex-col gap-3 text-xs text-neutral-300">
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Next.js Bundler:</span>
                <span className="font-mono text-white text-right">Next.js 14.2 + Turbopack/SWC</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Minification & Treeshaking:</span>
                <span className="font-mono text-emerald-400 text-right">Automatic CSS/JS Chunks</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Image Formats:</span>
                <span className="font-mono text-gold-400 text-right">AVIF & WebP (Lossless)</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <span className="text-neutral-400">Rate Limiting Protection:</span>
                <span className="font-mono text-emerald-400 text-right">Upstash Redis + Edge</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-400">Cache Tags:</span>
                <span className="font-mono text-gold-300 text-right">products, pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptimizationManagerClient;
