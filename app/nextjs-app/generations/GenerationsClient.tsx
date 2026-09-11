"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Search, Download, ExternalLink, X } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

export function GenerationsClient({ initialGenerations }: { initialGenerations: any[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedGen, setSelectedGen] = useState<any>(null);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: (info) => format(new Date(info.getValue() as string), "MMM d, yyyy HH:mm"),
      },
      {
        accessorKey: "userEmail",
        header: "Verified User Email",
        cell: (info) => info.getValue() || info.row.original.user?.email || "Guest",
      },
      {
        accessorKey: "prompt",
        header: "Prompt Text",
        cell: (info) => (
          <div className="max-w-xs truncate text-xs text-neutral-300" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        id: "thumbnail",
        header: "Thumbnail",
        cell: (info) => (
          <div 
            className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 cursor-pointer hover:border-gold-400 transition-colors"
            onClick={() => setSelectedGen(info.row.original)}
          >
            <Image src={info.row.original.resultImageUrl} alt="Thumbnail" fill className="object-cover" />
          </div>
        ),
      },
      {
        id: "actions",
        header: "Download",
        cell: (info) => (
          <a
            href={info.row.original.resultImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 text-gold-400 transition-colors flex items-center justify-center w-fit"
            title="Download Full Resolution"
          >
            <Download className="w-4 h-4" />
          </a>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: initialGenerations,
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
      <div className="bg-obsidian-900 p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search generations (email, prompt)..."
            className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
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
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-obsidian-950/50">
          <span className="text-xs text-neutral-500">
            Showing {table.getRowModel().rows.length} of {initialGenerations.length} total
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

      {/* High-Resolution Preview Modal */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/90 backdrop-blur-sm">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row">
            <div className="relative w-full md:w-2/3 h-64 md:h-[500px]">
              <Image src={selectedGen.resultImageUrl} alt="High Res" fill className="object-cover" />
            </div>
            <div className="w-full md:w-1/3 p-6 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-serif font-bold text-white">Generation Details</h3>
                <button onClick={() => setSelectedGen(null)} className="p-1 rounded-md text-neutral-400 hover:bg-neutral-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">User</span>
                <p className="text-sm text-neutral-300">{selectedGen.userEmail || selectedGen.user?.email || "Guest"}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Placement</span>
                <p className="text-sm text-neutral-300">{selectedGen.placement}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Prompt</span>
                <p className="text-sm text-neutral-300 bg-obsidian-950 p-3 rounded-lg border border-neutral-800">{selectedGen.prompt}</p>
              </div>

              <a
                href={selectedGen.resultImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto px-4 py-2.5 rounded-xl font-semibold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                Open Full Image <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
