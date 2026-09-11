import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultFinderSteps } from "@/lib/finderDefaultData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let steps = await prisma.finderStep.findMany({
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Auto-seed if database doesn't have finder steps yet
    if (steps.length === 0) {
      for (const stepDef of defaultFinderSteps) {
        await prisma.finderStep.create({
          data: {
            stepNumber: stepDef.stepNumber,
            key: stepDef.key,
            subtitle: stepDef.subtitle,
            title: stepDef.title,
            highlightWord: stepDef.highlightWord,
            description: stepDef.description,
            order: stepDef.order,
            options: {
              create: stepDef.options.map((opt) => ({
                label: opt.label,
                value: opt.value,
                imageUrl: opt.imageUrl || null,
                colorHex: opt.colorHex || null,
                order: opt.order,
              })),
            },
          },
        });
      }

      steps = await prisma.finderStep.findMany({
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      });
    }

    return NextResponse.json({ success: true, steps });
  } catch (error: any) {
    console.error("Failed to fetch finder steps:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch finder steps" }, { status: 500 });
  }
}
