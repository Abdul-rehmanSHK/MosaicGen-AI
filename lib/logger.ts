import { prisma } from "@/lib/prisma";

export interface LogParams {
  action: string;
  userId?: string | null;
  userEmail?: string | null;
  details: string | Record<string, any>;
}

export async function logActivity({ action, userId, userEmail, details }: LogParams) {
  try {
    const detailsString = typeof details === "string" ? details : JSON.stringify(details);

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        details: detailsString,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
