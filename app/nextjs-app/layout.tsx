import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileEdit
} from "lucide-react";
import { AdminThemeWrapper } from "@/components/AdminThemeWrapper";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const role = session?.user?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "CONTENT_EDITOR")) {
    redirect("/login?callbackUrl=/nextjs-app");
  }

  const isAdmin = role === "ADMIN";
  const isContentEditor = role === "CONTENT_EDITOR";

  return (
    <AdminThemeWrapper>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-6 flex flex-col justify-between shrink-0 shadow-xs md:h-screen md:overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Role Header */}
          <div className="flex items-center gap-3">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-sm ${
                isAdmin 
                  ? "bg-stone-900 text-amber-400" 
                  : "bg-stone-900 text-white"
              }`}
            >
              {isAdmin ? "A" : "E"}
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base">
                {isAdmin ? "Studio Admin" : "Content Editor"}
              </h2>
              <span className="text-[10px] text-amber-800 font-mono flex items-center gap-1 font-semibold">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Full Admin Access
                  </>
                ) : (
                  <>
                    <FileEdit className="w-3.5 h-3.5 text-amber-700" /> Content Editor Mode
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Navigation Links with Active Tab Highlighting */}
          <AdminSidebarNav isAdmin={isAdmin} />
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col gap-2">
          <div className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">Logged in as</span>
            <span className="font-semibold text-stone-900 block truncate">{session.user.email}</span>
            <span className="block text-[10px] text-stone-500 mt-0.5">
              Role: <strong className="text-stone-900 font-semibold">{role}</strong>
            </span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio Front
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full md:h-screen">
        {children}
      </main>
    </AdminThemeWrapper>
  );
}
