import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSiteAppearance } from "@/lib/appearance";
import { AppearanceManagerClient } from "./AppearanceManagerClient";

export const revalidate = 0;

export default async function AdminAppearancePage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "CONTENT_EDITOR")) {
    redirect("/login?callbackUrl=/nextjs-app/appearance");
  }

  const appearance = await getSiteAppearance();

  return <AppearanceManagerClient initialAppearance={appearance} />;
}
