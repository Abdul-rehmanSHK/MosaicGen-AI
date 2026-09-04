"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Grid,
  Layers,
  Compass,
  User,
  LayoutDashboard,
  LogOut,
  LogIn,
  Loader2,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const isNavActive = (path: string) => pathname === path;
  const role = session?.user?.role;
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-xl border-b border-neutral-200 dark:border-gold-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-serif font-bold text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors">
              MEC AI MOSAIC
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 tracking-widest uppercase font-mono">
              Bespoke Surface Studio
            </span>
          </div>
        </Link>

        {/* Public Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-obsidian-900/90 p-1.5 rounded-full border border-slate-200 dark:border-gold-500/20 shadow-inner">
          <Link
            href="/studio"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/studio")
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-obsidian-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Design Studio
          </Link>
          <Link
            href="/classic-collection"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/classic-collection")
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-obsidian-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Product Collections
          </Link>
          <Link
            href="/grand-medallions"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/grand-medallions")
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-obsidian-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Grand Medallions
          </Link>
          <Link
            href="/bespoke-studio-experience"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/bespoke-studio-experience")
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-obsidian-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Bespoke Experience
          </Link>
        </nav>

        {/* Dynamic Auth Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            </div>
          ) : role === "ADMIN" ? (
            /* Logged In as ADMIN: Show Go to Dashboard & Logout */
            <div className="flex items-center gap-2">
              <Link
                href="/nextjs-app"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
