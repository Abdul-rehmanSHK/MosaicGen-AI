"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const isNavActive = (path: string) => pathname === path;
  const isScratchMode = searchParams.get("mode") === "scratch";
  const role = session?.user?.role;
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-950/90 backdrop-blur-xl border-b border-gold-500/40 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 flex items-center justify-center text-obsidian-950 font-serif font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-white tracking-tight group-hover:text-amber-400 transition-colors">
              MEC AI MOSAIC
            </span>
            <span className="text-[10px] text-amber-400 tracking-widest uppercase font-mono">
              Bespoke Surface Studio
            </span>
          </div>
        </Link>

        {/* Public Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-gold-500/20 shadow-inner">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname === "/" && !isScratchMode
                ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold"
                : "text-neutral-300 hover:text-amber-300 hover:bg-obsidian-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Customize your space
          </Link>
          <Link
            href="/?mode=scratch"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname === "/" && isScratchMode
                ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold"
                : "text-neutral-300 hover:text-amber-300 hover:bg-obsidian-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Imagine from scratch
          </Link>
          <Link
            href="/finder"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNavActive("/finder")
                ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold"
                : "text-neutral-300 hover:text-amber-300 hover:bg-obsidian-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Find your aesthetic
          </Link>
        </nav>

        {/* Dynamic Auth Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            </div>
          ) : role === "ADMIN" ? (
            /* Logged In as ADMIN: Show Go to Dashboard & Logout */
            <div className="flex items-center gap-2">
              <Link
                href="/nextjs-app"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-200 flex items-center gap-1.5 transition-all border border-obsidian-700"
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
