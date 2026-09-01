import React from "react";
import { prisma } from "@/lib/prisma";
import { LogsManagerClient } from "./LogsManagerClient";

export const revalidate = 0;

export default async function NextAppLogsPage() {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">System Audit & Activity Logs</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Complete activity logging tracking actions executed by users, clients, and administrators across the studio.
        </p>
      </div>

      <LogsManagerClient initialLogs={logs} />
    </div>
  );
}
