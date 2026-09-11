"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Download, Eye, Phone, Mail } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

export function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLeads = useMemo(() => {
    if (statusFilter === "ALL") return initialLeads;
    return initialLeads.filter((l) => l.status === statusFilter);
  }, [initialLeads, statusFilter]);

  const exportCsv = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Space", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map((l) =>
        [
          format(new Date(l.createdAt), "yyyy-MM-dd"),
          `"${l.name}"`,
          `"${l.email}"`,
          `"${l.phone || ""}"`,
          `"${l.spaceType}"`,
          l.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Submission Date",
        cell: (info) => format(new Date(info.getValue() as string), "MMM d, yyyy"),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Contact Info",
        cell: (info) => {
          const email = info.getValue() as string;
          const phone = info.row.original.phone;
          return (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3 h-3 text-gold-400" /> {email}
              </span>
              {phone && (
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Phone className="w-3 h-3 text-neutral-500" /> {phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "spaceType",
        header: "Space Type",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          const colors: Record<string, string> = {
            NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            CONTACTED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            IN_PROGRESS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            CLOSED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          };
          const colorClass = colors[status] || "bg-neutral-800 text-neutral-400";
          return (
            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider ${colorClass}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: (info) => (
          <Link
            href={`/nextjs-app/leads/${info.row.original.id}`}
            className="p-2 rounded-lg bg-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 text-gold-400 transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredLeads,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-obsidian-900 p-4 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-obsidian-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <button
          onClick={exportCsv}
          className="w-full md:w-auto px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-neutral-200 border border-neutral-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-obsidian-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-obsidian-950 text-gold-400 font-serif uppercase tracking-wider text-xs border-b border-neutral-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-4 font-semibold whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-obsidian-800/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-neutral-500 text-sm">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-obsidian-950/50">
          <span className="text-xs text-neutral-500">
            Showing {table.getRowModel().rows.length} of {filteredLeads.length} total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg bg-obsidian-800 text-neutral-300 text-xs disabled:opacity-50 hover:bg-obsidian-700"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg bg-obsidian-800 text-neutral-300 text-xs disabled:opacity-50 hover:bg-obsidian-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
