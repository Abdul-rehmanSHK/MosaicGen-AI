"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminThemeWrapper } from "@/components/AdminThemeWrapper";

export default function NextJsAppAdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/nextjs-app";

  const [email, setEmail] = useState("admin@mosaic.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid admin authorization credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminThemeWrapper>
      <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl backdrop-blur-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-obsidian-950 font-serif font-bold text-2xl shadow-xl shadow-gold-500/20">
            N
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">
            <Shield className="w-3 h-3 text-gold-400" /> Admin Restricted Access
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">NextJS App Admin Portal</h1>
          <p className="text-xs text-neutral-400">Authorized administrator login for studio control & metrics</p>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950 border border-gold-500/20 text-xs text-neutral-300 flex flex-col gap-1">
          <span className="text-gold-400 font-bold font-mono flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Administrator Credentials:
          </span>
          <div className="text-neutral-300"><strong>Email:</strong> admin@mosaic.com</div>
          <div className="text-neutral-300"><strong>Password:</strong> admin123</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-400" /> Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-400" /> Security Password
            </label>
            <input
              type="password"
              required
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
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Sign In to NextJS App Admin
          </button>
        </form>
      </div>
    </div>
    </AdminThemeWrapper>
  );
}
