import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UsersManagerClient } from "./UsersManagerClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/nextjs-app/pages");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          generations: true,
          leads: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">User Accounts & Access Control</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Control studio user permissions with 2 explicit roles: <strong className="text-gold-400 font-bold">ADMIN</strong> (full studio access) and <strong className="text-amber-300 font-bold">CONTENT_EDITOR</strong> (content editing only).
        </p>
      </div>

      <UsersManagerClient initialUsers={users} />
    </div>
  );
}
