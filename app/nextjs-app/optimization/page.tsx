import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OptimizationManagerClient } from "./OptimizationManagerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OptimizationPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/nextjs-app");
  }

  return (
    <div className="flex flex-col gap-6">
      <OptimizationManagerClient />
    </div>
  );
}
