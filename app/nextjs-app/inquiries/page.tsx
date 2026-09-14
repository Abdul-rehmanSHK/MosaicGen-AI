import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InquiriesManagerClient } from "./InquiriesManagerClient";

export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/nextjs-app/pages");
  }

  const [inquiries, products] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        generation: true,
      },
    }),
    prisma.product.findMany({
      where: { isTrashed: false },
      select: { id: true, title: true, sampleImageUrl: true, pricePerSqFt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Client Lead & Sample Inquiries</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review quote requests from architects and designers, inspect complete client form submissions, and modify inquiry data.
        </p>
      </div>

      <InquiriesManagerClient initialInquiries={inquiries} availableProducts={products} />
    </div>
  );
}
