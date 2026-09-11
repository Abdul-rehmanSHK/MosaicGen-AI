import React from "react";
import { prisma } from "@/lib/prisma";
import { LeadsClient } from "./LeadsClient";

export const revalidate = 0;

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
      generation: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Client Leads & Inquiries</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage quote requests, space specifications, and follow-ups.
        </p>
      </div>

      <LeadsClient initialLeads={leads} />
    </div>
  );
}
