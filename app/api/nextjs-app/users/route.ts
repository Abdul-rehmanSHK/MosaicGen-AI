import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only an ADMIN can manage user accounts and roles");
  }
  return session.user;
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { userId, role, name, email, newPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const updateData: any = {};

    if (role !== undefined) {
      if (!["ADMIN", "CONTENT_EDITOR"].includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Role must be either 'ADMIN' or 'CONTENT_EDITOR'." }, 
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      // Check if email taken by another user
      const existing = await prisma.user.findFirst({
        where: { email: trimmedEmail, NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Email already in use by another account." }, { status: 400 });
      }
      updateData.email = trimmedEmail;
    }

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await logActivity({
      action: "USER_ACCOUNT_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { targetUserId: userId, updatedFields: Object.keys(updateData) },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user account" }, { status: 500 });
  }
}
