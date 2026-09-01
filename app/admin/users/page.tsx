import React from "react";
import { prisma } from "@/lib/prisma";
import { UsersManagerClient } from "./UsersManagerClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          generations: true,
          inquiries: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">User Accounts & Access Control</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage user credentials, switch Role-Based Access Control permissions (ADMIN / USER), and review studio activity.
        </p>
      </div>

      <UsersManagerClient initialUsers={users} />
    </div>
  );
}
