import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Mail, Phone, Calendar, Ruler, MessageSquare, CheckCircle, ExternalLink } from "lucide-react";
import { LeadStatusForm } from "./LeadStatusForm";

export const revalidate = 0;

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      generation: true,
    },
  });

  if (!lead) return notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      <Link
        href="/nextjs-app/leads"
        className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-2 mb-2 w-fit transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white leading-tight flex items-center gap-3">
            Lead Details
            <span className="text-sm font-mono px-3 py-1 bg-obsidian-800 text-neutral-400 rounded-lg">#{lead.id.slice(-6)}</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-2">Submitted on {new Date(lead.createdAt).toLocaleDateString()}</p>
        </div>
        
        <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 bg-obsidian-900 border border-neutral-800 rounded-2xl shadow-xl">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-gold-400" /> Client Info
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Name</span>
                <p className="text-sm text-neutral-200 font-medium">{lead.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Email</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-200">{lead.email}</p>
                  <a href={`mailto:${lead.email}`} className="text-gold-400 hover:text-gold-300">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Phone</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-200">{lead.phone || "Not provided"}</p>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="text-gold-400 hover:text-gold-300">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-[#25D366]/30"
                >
                  <MessageSquare className="w-4 h-4" /> Contact via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 bg-obsidian-900 border border-neutral-800 rounded-2xl shadow-xl">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gold-400" /> Space Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Space Type</span>
                <p className="text-sm text-white font-medium mt-1">{lead.spaceType}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Dimensions</span>
                <p className="text-sm text-white font-medium mt-1">{lead.roomDimensions || "Not provided"}</p>
              </div>
            </div>
            <div className="mt-6">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2 block">Client Message</span>
              <p className="text-sm text-neutral-300 bg-obsidian-950 p-4 rounded-xl border border-neutral-800 leading-relaxed whitespace-pre-wrap">
                {lead.message}
              </p>
            </div>
          </div>

          {(lead.generation || lead.product) && (
            <div className="p-6 bg-obsidian-900 border border-neutral-800 rounded-2xl shadow-xl">
              <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest border-b border-neutral-800 pb-3 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-400" /> Attached Designs
              </h2>
              
              {lead.generation && (
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden border border-gold-500/30 shrink-0 shadow-lg">
                    <Image src={lead.generation.resultImageUrl} alt="Generated Design" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] px-2 py-1 bg-gold-500/20 text-gold-400 rounded w-fit font-mono font-bold uppercase">AI GENERATED</span>
                    <p className="text-sm text-white font-medium">Prompt: {lead.generation.prompt}</p>
                    <a href={lead.generation.resultImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-400 hover:text-gold-300 mt-auto flex items-center gap-1">
                      View High Resolution <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {lead.product && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-obsidian-950 border border-neutral-800">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-neutral-700">
                    <Image src={lead.product.sampleImageUrl} alt={lead.product.title} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Interested Product</p>
                    <p className="text-sm font-serif font-bold text-white">{lead.product.title}</p>
                    <Link href={`/nextjs-app/products`} className="text-[10px] text-gold-400 hover:text-gold-300 flex items-center gap-1 mt-1">
                      View in Catalog <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
