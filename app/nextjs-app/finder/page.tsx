import React from "react";
import { prisma } from "@/lib/prisma";
import { defaultFinderSteps } from "@/lib/finderDefaultData";
import { FinderManagerClient } from "./FinderManagerClient";

export const revalidate = 0;

export default async function AdminFinderCMSPage() {
  let steps = await prisma.finderStep.findMany({
    orderBy: { order: "asc" },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Seed default 5 steps if not in database yet
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

  // Fetch active products from catalog for fallback
  const products = await prisma.product.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
  });

  // Fetch AI generated mosaic images from studio
  const rawGenerations = await prisma.aIGeneration.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      resultImageUrl: true,
      prompt: true,
      placement: true,
      userEmail: true,
      createdAt: true,
      status: true,
    },
  });

  const serializedGenerations = rawGenerations.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
  }));

  // Fetch saved user quiz submissions/results
  const savedResults = await prisma.finderResult.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Find Your Aesthetic CMS</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Dynamically customize the 5-step interactive quiz questions, descriptions, inspiration cards, color palettes, and view stored user quiz results.
        </p>
      </div>

      <FinderManagerClient
        initialSteps={steps}
        availableProducts={products}
        availableGenerations={serializedGenerations}
        initialResults={savedResults}
      />
    </div>
  );
}

