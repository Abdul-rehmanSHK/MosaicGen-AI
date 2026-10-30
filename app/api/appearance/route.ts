import { NextResponse } from "next/server";
import { getSiteAppearance } from "@/lib/appearance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const appearance = await getSiteAppearance();
    return NextResponse.json(
      { success: true, appearance },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch appearance" }, { status: 500 });
  }
}
