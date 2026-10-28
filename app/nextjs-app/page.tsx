import React from "react";
import { prisma } from "@/lib/prisma";
import { Sparkles, Users, Mail, DollarSign, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role === "CONTENT_EDITOR") {
    redirect("/nextjs-app/pages");
  }
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count({ where: { isTrashed: false } });
  const totalGenerations = await prisma.aIGeneration.count();
  const totalInquiries = await prisma.lead.count();

  // Estimate API Cost ($0.040 per DALL-E 3 / AI image render)
  const apiCostEstimate = (totalGenerations * 0.04).toFixed(2);

  const recentGenerations = await prisma.aIGeneration.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
  });

  const recentInquiries = await prisma.lead.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Analytics & Performance Overview</h1>
        <p className="text-xs text-stone-500 mt-1">
          Monitor live studio usage metrics, AI pipeline compute costs, and performance optimization controls.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-stone-900">{totalUsers}</span>
          <span className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-amber-700" /> Active User Accounts
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">Total AI Renderings</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-stone-900">{totalGenerations}</span>
          <span className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-amber-700" /> Inpainting executions
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">API Compute Cost Est.</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-stone-900">${apiCostEstimate}</span>
          <span className="text-[11px] text-stone-500">Based on $0.04/image render</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">Client Lead Inquiries</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-stone-900">{totalInquiries}</span>
          <span className="text-[11px] text-amber-800 font-medium">Sample box quote requests</span>
        </div>
      </div>

      {/* Site Optimization & Cache Quick Banner */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <Zap className="w-6 h-6 text-amber-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-stone-900">
                Site Performance & Cache Center
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Next.js 15 tagged cache (<code className="text-stone-900 font-semibold font-mono">products</code>, <code className="text-stone-900 font-semibold font-mono">pages</code>), AVIF/WebP image engine, and database vacuuming.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/nextjs-app/optimization"
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif font-medium text-xs flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            Manage Cache & Optimization
          </Link>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent AI Generations Showcase (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" /> Recent AI Studio Renderings
            </h2>
            <Link href="/nextjs-app/generations" className="text-xs text-stone-600 hover:text-stone-900 font-medium hover:underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentGenerations.length === 0 ? (
              <p className="text-xs text-stone-500">No AI generations logged yet.</p>
            ) : (
              recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                    <Image src={gen.resultImageUrl} alt={gen.prompt} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">{gen.placement}</span>
                    <p className="text-xs text-stone-900 font-medium truncate">{gen.prompt}</p>
                    <span className="text-[10px] text-stone-500">
                      {gen.user ? gen.user.name || gen.user.email : "Guest User"} • {new Date(gen.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries List (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700" /> Active Lead Quotes
            </h2>
            <Link href="/nextjs-app/inquiries" className="text-xs text-stone-600 hover:text-stone-900 font-medium hover:underline">
              Manage Leads
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentInquiries.length === 0 ? (
              <p className="text-xs text-stone-500">No client inquiries yet.</p>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-900">{inq.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono font-semibold">
                      {inq.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">{inq.email}</span>
                  <p className="text-xs text-stone-700 line-clamp-2 italic">"{inq.message}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
