"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl backdrop-blur-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center text-obsidian-950 font-serif font-bold text-2xl shadow-lg shadow-gold-500/20">
            M
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-2">Create Architect Account</h1>
          <p className="text-xs text-neutral-400">Join MEC AI Studio to save renders and request custom sample boxes</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold-400" /> Full Name / Architectural Firm
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Vance"
              className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="architect@firm.com"
              className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-400" /> Password (Min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-gold-400 transition-all"
            />
          </div>

          {error && <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Register Account
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400 border-t border-neutral-800 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-300 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
