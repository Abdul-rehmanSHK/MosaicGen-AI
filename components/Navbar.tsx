"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { UserAccountMenu } from "@/components/studio/UserAccountMenu";

interface MenuItem {
  label: string;
  url: string;
  external?: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const role = session?.user?.role;

  const [appearance, setAppearance] = useState({
    headerBrandName: "MEC AI MOSAIC",
    headerTagline: "Bespoke Surface Studio",
    headerLogoUrl: null as string | null,
    headerMenu: [
      { label: "Customize your space", url: "/" },
      { label: "Imagine from scratch", url: "/from-scratch" },
      { label: "Find your aesthetic", url: "/finder" },
      { label: "Contact Us", url: "https://zakiahmarble.com/contact-us/", external: true },
    ] as MenuItem[],
  });

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const syncEmail = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("mec_verified_email") : null;
      setVerifiedEmail(stored);
    };
    syncEmail();
    window.addEventListener("mec_verified_email_updated", syncEmail);
    return () => window.removeEventListener("mec_verified_email_updated", syncEmail);
  }, []);

  useEffect(() => {
    fetch("/api/appearance")
      .then((res) => res.json())
      .then((data) => {
        if (data?.appearance) {
          let menu: MenuItem[] = [];
          try {
            menu = JSON.parse(data.appearance.headerMenuJson || "[]");
          } catch {
            menu = [];
          }

          setAppearance({
            headerBrandName: data.appearance.headerBrandName || "MEC AI MOSAIC",
            headerTagline: data.appearance.headerTagline || "Bespoke Surface Studio",
            headerLogoUrl: data.appearance.headerLogoUrl || null,
            headerMenu: menu.length > 0 ? menu : [
              { label: "Customize your space", url: "/" },
              { label: "Imagine from scratch", url: "/from-scratch" },
              { label: "Find your aesthetic", url: "/finder" },
              { label: "Contact Us", url: "https://zakiahmarble.com/contact-us/", external: true },
            ],
          });
        }
      })
      .catch(() => {});
  }, []);

  const isNavActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-950/90 backdrop-blur-xl border-b border-gold-500/40 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          {appearance.headerLogoUrl ? (
            <div className="relative w-10 h-10 rounded-xl bg-obsidian-900 border border-gold-500/30 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src={appearance.headerLogoUrl}
                alt={appearance.headerBrandName}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 flex items-center justify-center text-obsidian-950 font-serif font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
              {appearance.headerBrandName ? appearance.headerBrandName[0].toUpperCase() : "M"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-white tracking-tight group-hover:text-amber-400 transition-colors">
              {appearance.headerBrandName}
            </span>
            <span className="text-[10px] text-amber-400 tracking-widest uppercase font-mono">
              {appearance.headerTagline}
            </span>
          </div>
        </Link>

        {/* Public Navigation Pills (Dynamic from CMS) */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-gold-500/20 shadow-inner">
          {appearance.headerMenu.map((item, idx) => {
            const active = isNavActive(item.url);

            if (item.external) {
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 text-neutral-300 hover:text-amber-300 hover:bg-obsidian-800 transition-all"
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={idx}
                href={item.url}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold"
                    : "text-neutral-300 hover:text-amber-300 hover:bg-obsidian-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Auth Action Buttons & User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href="https://zakiahmarble.com/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3.5 py-2 rounded-full text-xs font-semibold bg-obsidian-900/90 border border-gold-500/30 text-neutral-300 hover:text-gold-300 hover:border-gold-400 transition-all items-center gap-1.5 shadow-sm"
          >
            Speak to a Specialist <ExternalLink className="w-3 h-3 text-gold-400" />
          </a>

          {/* User Account Popover (Active when verified) */}
          {verifiedEmail && (
            <UserAccountMenu
              email={verifiedEmail}
              onUseDifferentEmail={() => {
                localStorage.removeItem("mec_verified_email");
                setVerifiedEmail(null);
                window.dispatchEvent(new Event("mec_verified_email_updated"));
              }}
            />
          )}

          {isLoading ? (
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            </div>
          ) : role === "ADMIN" || role === "CONTENT_EDITOR" ? (
            /* Logged In as ADMIN or CONTENT_EDITOR: Show Go to Studio & Logout */
            <div className="flex items-center gap-2">
              <Link
                href={role === "ADMIN" ? "/nextjs-app" : "/nextjs-app/pages"}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-obsidian-950 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> {role === "ADMIN" ? "Go to Dashboard" : "Content Studio CMS"}
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
