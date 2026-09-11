import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAdminAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    });

    await logAdminAction(
      session.user.id,
      "UPDATED_LEAD_STATUS",
      "Lead",
      params.id,
      { newStatus: status }
    );

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return NextResponse.json({ error: "Failed to update lead status." }, { status: 500 });
  }
}
