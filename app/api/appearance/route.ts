import { NextResponse } from "next/server";
import { getSiteAppearance } from "@/lib/appearance";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const appearance = await getSiteAppearance();
    return NextResponse.json({ success: true, appearance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch appearance" }, { status: 500 });
  }
}
