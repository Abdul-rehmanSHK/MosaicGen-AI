import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Sparkles, FileText, Users, Mail, ArrowLeft, Shield, Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function NextJsAppAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/nextjs-app/login");
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col md:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-obsidian-900 border-r border-gold-500/20 p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Admin Header & Theme Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center text-obsidian-950 font-serif font-bold text-lg shadow-md shadow-gold-500/20">
                N
              </div>
              <div>
                <h2 className="font-serif font-bold text-white text-base">NextJS App Admin</h2>
                <span className="text-[10px] text-gold-400 font-mono flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin Restricted
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/nextjs-app"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" /> Dashboard & Analytics
            </Link>
            <Link
              href="/nextjs-app/products"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Package className="w-4 h-4 text-gold-400" /> Products Catalog
            </Link>
            <Link
              href="/nextjs-app/generations"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Sparkles className="w-4 h-4 text-gold-400" /> AI Generations
            </Link>
            <Link
              href="/nextjs-app/pages"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <FileText className="w-4 h-4 text-gold-400" /> CMS Dynamic Pages
            </Link>
            <Link
              href="/nextjs-app/users"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Users className="w-4 h-4 text-gold-400" /> Admin Users
            </Link>
            <Link
              href="/nextjs-app/inquiries"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Mail className="w-4 h-4 text-gold-400" /> Client Inquiries
            </Link>
            <Link
              href="/nextjs-app/logs"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-neutral-300 hover:text-gold-300 hover:bg-obsidian-800 transition-all"
            >
              <Activity className="w-4 h-4 text-gold-400" /> System Audit Logs
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-neutral-300 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio Front
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
