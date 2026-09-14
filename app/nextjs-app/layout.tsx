import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Sparkles, 
  FileText, 
  Users, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  FileEdit,
  Palette, 
  Image as ImageIcon,
  Sliders
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminThemeWrapper } from "@/components/AdminThemeWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const role = session?.user?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "CONTENT_EDITOR")) {
    redirect("/login?callbackUrl=/nextjs-app");
  }

  const isAdmin = role === "ADMIN";
  const isContentEditor = role === "CONTENT_EDITOR";

  return (
    <AdminThemeWrapper>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-obsidian-900 border-r border-gold-500/20 p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Role Header & Theme Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-md ${
                  isAdmin 
                    ? "bg-gold-500 text-obsidian-950 shadow-gold-500/20" 
                    : "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-600/20"
                }`}
              >
                {isAdmin ? "A" : "E"}
              </div>
              <div>
                <h2 className="font-serif font-bold text-white text-base">
                  {isAdmin ? "Studio Admin" : "Content Editor"}
                </h2>
                <span className="text-[10px] text-gold-400 font-mono flex items-center gap-1">
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-gold-400" /> Full Admin Access
                    </>
                  ) : (
                    <>
                      <FileEdit className="w-3 h-3 text-amber-400" /> Content Editor Mode
                    </>
                  )}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {isAdmin && (
              <>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 px-4 pt-1 pb-0.5">
                  Studio Administration
                </span>
                <Link
                  href="/nextjs-app"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-gold-400" /> Dashboard & Analytics
                </Link>
                <Link
                  href="/nextjs-app/generations"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-gold-400" /> AI Generations
                </Link>
                <Link
                  href="/nextjs-app/users"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
                >
                  <Users className="w-4 h-4 text-gold-400" /> Users & Roles
                </Link>
                <Link
                  href="/nextjs-app/inquiries"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
                >
                  <Mail className="w-4 h-4 text-gold-400" /> Client Inquiries
                </Link>
              </>
            )}

            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 px-4 pt-2 pb-0.5">
              Content & Studio Assets
            </span>
            <Link
              href="/nextjs-app/pages"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <FileText className="w-4 h-4 text-gold-400" /> Pages Content CMS
            </Link>
            <Link
              href="/nextjs-app/finder"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Palette className="w-4 h-4 text-gold-400" /> Aesthetic Finder CMS
            </Link>
            <Link
              href="/nextjs-app/media"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <ImageIcon className="w-4 h-4 text-gold-400" /> Media Library
            </Link>
            <Link
              href="/nextjs-app/products"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Package className="w-4 h-4 text-gold-400" /> Products Catalog
            </Link>
            <Link
              href="/nextjs-app/appearance"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Sliders className="w-4 h-4 text-gold-400" /> Appearance & Navigation
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex flex-col gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-obsidian-950 border border-neutral-800 text-[11px] text-neutral-400">
            Logged as: <span className="font-bold text-gold-300">{session.user.email}</span>
            <span className="block text-[10px] text-neutral-500">
              Role: <strong className="text-white">{role}</strong>
            </span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio Front
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </AdminThemeWrapper>
  );
}
