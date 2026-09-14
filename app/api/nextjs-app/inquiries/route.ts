import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only ADMIN can access client inquiries");
  }
  return session.user;
}

// GET: Retrieve inquiries
export async function GET() {
  try {
    await verifyAdmin();
    const inquiries = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        generation: true,
      },
    });
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch inquiries" }, { status: 401 });
  }
}

// POST: Manually create a new client inquiry / quote request
export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { name, email, phone, spaceType, roomDimensions, message, status, adminNotes, quoteAmount, productId } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Client name, email, and message are required." }, { status: 400 });
    }

    const newInquiry = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        spaceType: spaceType || "General Surface",
        roomDimensions: roomDimensions || null,
        message,
        status: status || "NEW",
        adminNotes: adminNotes || null,
        quoteAmount: quoteAmount ? parseFloat(quoteAmount) : null,
        productId: productId || null,
      },
      include: {
        product: true,
        generation: true,
      },
    });

    await logActivity({
      action: "INQUIRY_CREATED_MANUALLY",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { inquiryId: newInquiry.id, clientName: name, email },
    });

    return NextResponse.json({ success: true, inquiry: newInquiry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create inquiry" }, { status: 500 });
  }
}

// PUT: Modify inquiry details (full form data & admin notes)
export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { 
      inquiryId, 
      status, 
      name, 
      email, 
      phone, 
      spaceType, 
      roomDimensions, 
      message, 
      adminNotes, 
      quoteAmount 
    } = body;

    if (!inquiryId) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (spaceType !== undefined) updateData.spaceType = spaceType;
    if (roomDimensions !== undefined) updateData.roomDimensions = roomDimensions || null;
    if (message !== undefined) updateData.message = message;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes || null;
    if (quoteAmount !== undefined) updateData.quoteAmount = quoteAmount ? parseFloat(quoteAmount) : null;

    const updatedInquiry = await prisma.lead.update({
      where: { id: inquiryId },
      data: updateData,
      include: {
        product: true,
        generation: true,
      },
    });

    await logActivity({
      action: "INQUIRY_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { inquiryId, updateData },
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update inquiry" }, { status: 500 });
  }
}

// DELETE: Remove single inquiry or bulk delete
export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    const action = searchParams.get("action");

    if (action === "clear-all") {
      const deleted = await prisma.lead.deleteMany();
      await logActivity({
        action: "ALL_INQUIRIES_CLEARED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { count: deleted.count },
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }

    let ids: string[] = [];
    if (idsParam) {
      ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      ids = [id];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) ids = body.ids;
        if (body.id) ids.push(body.id);
      } catch {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Inquiry ID(s) required" }, { status: 400 });
    }

    const deleteResult = await prisma.lead.deleteMany({
      where: { id: { in: ids } },
    });

    await logActivity({
      action: "INQUIRIES_BULK_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { ids, count: deleteResult.count },
    });

    return NextResponse.json({ success: true, count: deleteResult.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete inquiry" }, { status: 500 });
  }
}
