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
    headerBrandName: "Zakiah Mosaics",
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
      const stored = typeof window !== "undefined"
        ? localStorage.getItem("zm_verified_email") || localStorage.getItem("mec_verified_email")
        : null;
      if (stored) {
        setVerifiedEmail(stored);
      } else if (session?.user?.email) {
        setVerifiedEmail(session.user.email.toLowerCase().trim());
      } else {
        setVerifiedEmail(null);
      }
    };
    syncEmail();
    window.addEventListener("mec_verified_email_updated", syncEmail);
    window.addEventListener("zm_verified_email_updated", syncEmail);
    return () => {
      window.removeEventListener("mec_verified_email_updated", syncEmail);
      window.removeEventListener("zm_verified_email_updated", syncEmail);
    };
  }, [session]);

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
            headerBrandName: data.appearance.headerBrandName || "Zakiah Mosaics",
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
    <header className="sticky top-0 z-40 w-full bg-[#f4f3f2]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          {appearance.headerLogoUrl ? (
            <div className="relative w-10 h-10 rounded-xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <Image
                src={appearance.headerLogoUrl}
                alt={appearance.headerBrandName}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl tracking-tight text-stone-900">
                {appearance.headerBrandName || "MEC"}
              </span>
              <span className="font-serif italic text-base text-stone-600 font-normal">
                AI Studio
              </span>
            </div>
          )}
        </Link>

        {/* Public Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 ${
              isNavActive("/")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            CUSTOMIZE YOUR SPACE
          </Link>

          <Link
            href="/from-scratch"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 ${
              isNavActive("/from-scratch")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            IMAGINE FROM SCRATCH
          </Link>

          <Link
            href="/finder"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 ${
              isNavActive("/finder")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            FIND YOUR AESTHETIC
          </Link>
        </nav>

        {/* Dynamic Auth Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
          <a
            href="https://zakiahmarble.com/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 transition-all items-center gap-1.5 shadow-sm"
          >
            Speak to a Specialist <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>

          {/* User Account Popover (Active when verified) */}
          {verifiedEmail ? (
            <UserAccountMenu
              email={verifiedEmail}
              onUseDifferentEmail={() => {
                localStorage.removeItem("zm_verified_email");
                localStorage.removeItem("mec_verified_email");
                localStorage.removeItem("zm_verified_token");
                document.cookie = "zm_verified_token=; path=/; max-age=0";
                document.cookie = "zm_verified_email=; path=/; max-age=0";
                setVerifiedEmail(null);
                window.dispatchEvent(new Event("zm_verified_email_updated"));
                window.dispatchEvent(new Event("mec_verified_email_updated"));
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-stone-200/80 border border-stone-300 text-stone-700 text-xs font-bold flex items-center justify-center font-mono">
              AB
            </div>
          )}

          {isLoading ? (
            <div className="px-2 py-1 flex items-center gap-2 text-xs text-stone-400">
              <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            </div>
          ) : role === "ADMIN" || role === "CONTENT_EDITOR" ? (
            /* Logged In as ADMIN or CONTENT_EDITOR */
            <div className="flex items-center gap-2">
              <Link
                href={role === "ADMIN" ? "/nextjs-app" : "/nextjs-app/pages"}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 transition-all border border-stone-300"
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
