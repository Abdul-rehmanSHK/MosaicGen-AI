"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Sparkles, 
  FileText, 
  Users, 
  Mail, 
  Palette, 
  Image as ImageIcon,
  Sliders,
  Zap
} from "lucide-react";

interface AdminSidebarNavProps {
  isAdmin: boolean;
}

export function AdminSidebarNav({ isAdmin }: AdminSidebarNavProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/nextjs-app") {
      return pathname === "/nextjs-app" || pathname === "/nextjs-app/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const adminLinks = [
    { href: "/nextjs-app", label: "Dashboard & Analytics", icon: LayoutDashboard },
    { href: "/nextjs-app/optimization", label: "Optimization & Cache", icon: Zap },
    { href: "/nextjs-app/generations", label: "AI Generations", icon: Sparkles },
    { href: "/nextjs-app/users", label: "Users & Roles", icon: Users },
    { href: "/nextjs-app/inquiries", label: "Client Inquiries", icon: Mail },
  ];

  const contentLinks = [
    { href: "/nextjs-app/products", label: "Products Catalog", icon: Package },
    { href: "/nextjs-app/pages", label: "Pages Content CMS", icon: FileText },
    { href: "/nextjs-app/media", label: "Media Library", icon: ImageIcon },
    { href: "/nextjs-app/appearance", label: "Appearance & Navigation", icon: Sliders },
  ];

  const renderLink = (link: { href: string; label: string; icon: any }) => {
    const active = isLinkActive(link.href);
    const Icon = link.icon;

    return (
      <Link
        key={link.href}
        href={link.href}
        className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-3 transition-all ${
          active
            ? "bg-stone-900 text-white shadow-xs font-semibold"
            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        }`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-stone-500"}`} />
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1.5">
      {isAdmin && (
        <>
          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 px-4 pt-1 pb-0.5 font-bold">
            Studio Administration
          </span>
          {adminLinks.map(renderLink)}
        </>
      )}

      <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 px-4 pt-2 pb-0.5 font-bold">
        Content & Studio Assets
      </span>
      {contentLinks.map(renderLink)}
    </nav>
  );
}
