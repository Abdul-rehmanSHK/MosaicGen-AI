import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Activity, User as UserIcon, Tag, Clock } from "lucide-react";

export const revalidate = 0;

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
    take: 100, // Limit to recent 100 logs for performance
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-gold-400" /> System Audit Logs
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review recent administrative actions and system events. Showing last 100 entries.
        </p>
      </div>

      <div className="bg-obsidian-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider text-xs border-b border-neutral-800">
              <tr>
                <th className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Timestamp</div></th>
                <th className="p-4"><div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Admin User</div></th>
                <th className="p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Action</div></th>
                <th className="p-4"><div className="flex items-center gap-2"><Tag className="w-4 h-4" /> Resource Details</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-500 text-sm">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-obsidian-800/50 transition-colors">
                    <td className="p-4 font-mono text-xs whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{log.user?.name || "System"}</span>
                        <span className="text-[10px] text-neutral-500">{log.user?.email || "N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md border border-neutral-700 bg-obsidian-950 text-[10px] font-bold tracking-wider text-neutral-300 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 max-w-sm">
                        {log.targetResource && (
                          <span className="text-xs text-gold-400 font-mono">
                            {log.targetResource} #{log.resourceId}
                          </span>
                        )}
                        {log.metadata && (
                          <span className="text-[10px] text-neutral-500 truncate" title={log.metadata}>
                            {log.metadata}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
