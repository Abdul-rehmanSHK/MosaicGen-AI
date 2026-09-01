import React from "react";
import { prisma } from "@/lib/prisma";
import { Sparkles, Users, Mail, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 0;

export default async function NextJsAppAdminDashboardPage() {
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalGenerations = await prisma.aIGeneration.count();
  const totalInquiries = await prisma.inquiry.count();

  const apiCostEstimate = (totalGenerations * 0.04).toFixed(2);

  const recentGenerations = await prisma.aIGeneration.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
  });

  const recentInquiries = await prisma.inquiry.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">NextJS App Analytics Overview</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Monitor live studio usage metrics, AI pipeline compute costs, and client architect inquiries.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-white">{totalUsers}</span>
          <span className="text-[11px] text-gold-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active User Accounts
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">Total AI Renderings</span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-white">{totalGenerations}</span>
          <span className="text-[11px] text-gold-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Inpainting executions
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">API Compute Cost Est.</span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-white">${apiCostEstimate}</span>
          <span className="text-[11px] text-neutral-400">Based on $0.04/image render</span>
        </div>

        <div className="p-6 rounded-2xl bg-obsidian-900 border border-gold-500/20 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">Client Lead Inquiries</span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-serif font-bold text-white">{totalInquiries}</span>
          <span className="text-[11px] text-gold-400">Sample box quote requests</span>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" /> Recent AI Studio Renderings
            </h2>
            <Link href="/nextjs-app/generations" className="text-xs text-gold-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentGenerations.length === 0 ? (
              <p className="text-xs text-neutral-400">No AI generations logged yet.</p>
            ) : (
              recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-obsidian-950 border border-neutral-800"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                    <Image src={gen.resultImageUrl} alt={gen.prompt} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-gold-400 font-bold uppercase">{gen.placement}</span>
                    <p className="text-xs text-white font-medium truncate">{gen.prompt}</p>
                    <span className="text-[10px] text-neutral-400">
                      {gen.user ? gen.user.name || gen.user.email : "Guest User"} • {new Date(gen.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-obsidian-900 border border-neutral-800 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-400" /> Active Lead Quotes
            </h2>
            <Link href="/nextjs-app/inquiries" className="text-xs text-gold-400 hover:underline">
              Manage Leads
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentInquiries.length === 0 ? (
              <p className="text-xs text-neutral-400">No client inquiries yet.</p>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{inq.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono">
                      {inq.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{inq.email}</span>
                  <p className="text-xs text-neutral-300 line-clamp-2 italic">"{inq.message}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
