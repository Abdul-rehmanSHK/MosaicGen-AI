"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-serif font-bold text-white">Public Registration Disabled</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Public user accounts and registration are not required or supported. Portal access is strictly reserved for authorized site owners and administrators.
          </p>
        </div>

        <Link
          href="/"
          className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Studio Showcase
        </Link>
      </div>
    </div>
  );
}
