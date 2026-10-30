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
    const fetchAppearance = () => {
      fetch("/api/appearance", { cache: "no-store" })
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
    };

    fetchAppearance();
    window.addEventListener("appearance_updated", fetchAppearance);
    return () => {
      window.removeEventListener("appearance_updated", fetchAppearance);
    };
  }, []);

  const isNavActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f4f3f2]/95 backdrop-blur-md border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
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
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 shrink min-w-0">
          <Link
            href="/"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 whitespace-nowrap ${
              isNavActive("/")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            CUSTOMIZE YOUR SPACE
          </Link>

          <Link
            href="/from-scratch"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 whitespace-nowrap ${
              isNavActive("/from-scratch")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            IMAGINE FROM SCRATCH
          </Link>

          <Link
            href="/finder"
            className={`text-xs font-bold uppercase tracking-wider transition-all pb-1.5 whitespace-nowrap ${
              isNavActive("/finder")
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-500 hover:text-stone-900 border-b-2 border-transparent"
            }`}
          >
            FIND YOUR AESTHETIC
          </Link>
        </nav>

        {/* Dynamic Auth Action Buttons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://zakiahmarble.com/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 transition-all items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap"
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
          ) : null}

          {isLoading ? (
            <div className="px-2 py-1 flex items-center gap-2 text-xs text-stone-400">
              <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            </div>
          ) : role === "ADMIN" || role === "CONTENT_EDITOR" ? (
            /* Logged In as ADMIN or CONTENT_EDITOR: Compact layout to protect navigation spacing */
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href={role === "ADMIN" ? "/nextjs-app" : "/nextjs-app/pages"}
                className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 flex items-center gap-1.5 transition-all shadow-xs shrink-0 whitespace-nowrap"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 transition-all border border-stone-300 shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
