import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyEditorOrAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
    throw new Error("Unauthorized: Access restricted to ADMIN and CONTENT_EDITOR");
  }
  return session.user;
}

export async function GET() {
  try {
    await verifyEditorOrAdmin();
    const steps = await prisma.finderStep.findMany({
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, steps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const body = await request.json();
    const { action, stepId, stepData, optionId, optionData } = body;

    // 1. Update Step text / question
    if (action === "UPDATE_STEP" && stepId && stepData) {
      const updatedStep = await prisma.finderStep.update({
        where: { id: stepId },
        data: {
          title: stepData.title,
          highlightWord: stepData.highlightWord || null,
          subtitle: stepData.subtitle || null,
          description: stepData.description,
          featuredProductIds: stepData.featuredProductIds !== undefined ? (typeof stepData.featuredProductIds === "string" ? stepData.featuredProductIds : JSON.stringify(stepData.featuredProductIds || [])) : undefined,
        },
      });

      await logActivity({
        action: "FINDER_STEP_UPDATED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { stepId, title: stepData.title },
      });

      return NextResponse.json({ success: true, step: updatedStep });
    }

    // 2. Update Option details (label, imageUrl, colorHex)
    if (action === "UPDATE_OPTION" && optionId && optionData) {
      const updatedOption = await prisma.finderOption.update({
        where: { id: optionId },
        data: {
          label: optionData.label,
          value: optionData.value || undefined,
          imageUrl: optionData.imageUrl || null,
          colorHex: optionData.colorHex || null,
        },
      });

      await logActivity({
        action: "FINDER_OPTION_UPDATED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { optionId, label: optionData.label },
      });

      return NextResponse.json({ success: true, option: updatedOption });
    }

    // 3. Add New Option
    if (action === "ADD_OPTION" && stepId && optionData) {
      const maxOrder = await prisma.finderOption.findFirst({
        where: { stepId },
        orderBy: { order: "desc" },
      });

      const newOption = await prisma.finderOption.create({
        data: {
          stepId,
          label: optionData.label,
          value: optionData.value || optionData.label.toLowerCase().replace(/\s+/g, "-"),
          imageUrl: optionData.imageUrl || null,
          colorHex: optionData.colorHex || null,
          order: (maxOrder?.order || 0) + 1,
        },
      });

      await logActivity({
        action: "FINDER_OPTION_ADDED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { stepId, optionLabel: optionData.label },
      });

      return NextResponse.json({ success: true, option: newOption });
    }

    // 4. Delete Option
    if (action === "DELETE_OPTION" && optionId) {
      await prisma.finderOption.delete({
        where: { id: optionId },
      });

      await logActivity({
        action: "FINDER_OPTION_DELETED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { optionId },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update finder configuration" }, { status: 500 });
  }
}
