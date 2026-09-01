import React from "react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Sparkles, User, Calendar, MapPin, Grid } from "lucide-react";

export const revalidate = 0;

export default async function AdminGenerationsPage() {
  const generations = await prisma.aIGeneration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">AI Studio Generations Gallery</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Visual gallery of all user AI surface renderings, prompt inspects, inpainting masks, and reference products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((gen) => (
          <div
            key={gen.id}
            className="rounded-2xl bg-obsidian-900 border border-neutral-800 overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="relative w-full h-56 bg-obsidian-950">
              <Image src={gen.resultImageUrl} alt={gen.prompt} fill className="object-cover" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-obsidian-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[10px] font-mono uppercase font-bold">
                {gen.placement}
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold text-white line-clamp-3 italic">
                "{gen.prompt}"
              </p>

              <div className="flex flex-col gap-1.5 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gold-400" /> User:
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {gen.user ? gen.user.name || gen.user.email : "Guest User"}
                  </span>
                </div>

                {gen.product && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Grid className="w-3 h-3 text-gold-400" /> Style:
                    </span>
                    <span className="text-gold-300 font-medium truncate max-w-[140px]">{gen.product.title}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold-400" /> Date:
                  </span>
                  <span className="text-neutral-200">{new Date(gen.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
