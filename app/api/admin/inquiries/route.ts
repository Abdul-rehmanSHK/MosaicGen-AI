import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { inquiryId, status } = body;

    if (!inquiryId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    await logActivity({
      action: "INQUIRY_STATUS_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { inquiryId, status },
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update inquiry status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    await prisma.inquiry.delete({ where: { id } });

    await logActivity({
      action: "INQUIRY_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { inquiryId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete inquiry" }, { status: 500 });
  }
}
