import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeamClient } from "./TeamClient";
import { ShieldAlert } from "lucide-react";

export const revalidate = 0;

export default async function TeamPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const currentUserId = session.user.id;

  const users = await prisma.user.findMany({
    where: isSuperAdmin ? {} : { id: currentUserId }, // If not super admin, only fetch themselves
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    }
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Team Management</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {isSuperAdmin 
            ? "Manage studio access, assign roles, and administer admin accounts."
            : "Manage your personal profile and credentials."}
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            You have <strong className="font-bold">ADMIN</strong> access. You can update your own profile. 
            Only a <strong className="font-bold">SUPER_ADMIN</strong> can create new accounts or assign roles to other team members.
          </p>
        </div>
      )}

      <TeamClient initialUsers={users} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} />
    </div>
  );
}
