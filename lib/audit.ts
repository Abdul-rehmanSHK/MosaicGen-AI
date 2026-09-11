import { prisma } from "@/lib/prisma";

export async function logAdminAction(
  adminId: string,
  action: string,
  targetResource?: string,
  resourceId?: string,
  metadata?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetResource,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
