import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageEditorForm } from "@/components/admin/PageEditorForm";

export const revalidate = 0;

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditPageRoute({ params }: EditPageProps) {
  const { id } = params;

  const page = await prisma.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return <PageEditorForm initialData={page} isNew={false} />;
}
