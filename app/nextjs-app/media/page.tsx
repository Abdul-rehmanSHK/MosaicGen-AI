import React from "react";
import { prisma } from "@/lib/prisma";
import { MediaManagerClient } from "./MediaManagerClient";

export const revalidate = 0;

export default async function AdminMediaPage() {
  const mediaList = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalOriginalBytes = mediaList.reduce((acc, m) => acc + (m.originalSize || m.size), 0);
  const totalOptimizedBytes = mediaList.reduce((acc, m) => acc + m.size, 0);
  const bytesSaved = Math.max(0, totalOriginalBytes - totalOptimizedBytes);

  const initialStats = {
    totalCount: mediaList.length,
    totalOriginalBytes,
    totalOptimizedBytes,
    bytesSaved,
    savingsPercent: totalOriginalBytes > 0 ? Math.round((bytesSaved / totalOriginalBytes) * 100) : 0,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Media Library & Optimizer</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Upload and manage studio assets. All uploaded imagery is automatically compressed and converted to modern WebP format for high performance.
        </p>
      </div>

      <MediaManagerClient initialMedia={mediaList} initialStats={initialStats} />
    </div>
  );
}
