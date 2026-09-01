import React from "react";
import { prisma } from "@/lib/prisma";
import { InquiriesManagerClient } from "./InquiriesManagerClient";

export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      generation: true,
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Client Lead & Sample Inquiries</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review quote requests from architects and designers, inspect attached mosaic specs, and update dispatch status.
        </p>
      </div>

      <InquiriesManagerClient initialInquiries={inquiries} />
    </div>
  );
}
