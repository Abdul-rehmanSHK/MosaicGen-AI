"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function submitInquiry(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  let isSuccess = false;

  try {
    // 1. Extract form values
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || null;
    const spaceType = formData.get("spaceType") as string;
    const dimensions = (formData.get("dimensions") as string) || null;
    const message = formData.get("message") as string;
    const designImageUrl = (formData.get("designImageUrl") as string) || null;

    // 2. Validation
    if (!name || name.trim() === "") {
      return { error: "Please enter your full name." };
    }

    if (!email || !email.includes("@")) {
      return { error: "Please provide a valid email address." };
    }

    if (!spaceType || spaceType.trim() === "") {
      return { error: "Please select or enter a space type." };
    }

    if (!message || message.trim() === "") {
      return { error: "Please provide a message or inquiry details." };
    }

    // 3. Database Integration: Save to PostgreSQL/Database via Prisma
    await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        spaceType: spaceType.trim(),
        dimensions: dimensions ? dimensions.trim() : null,
        message: message.trim(),
        designImageUrl: designImageUrl ? designImageUrl.trim() : null,
      },
    });

    // 4. Email Notification: Send email to Admin via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: adminEmail,
      subject: `🔔 New Customer Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #333333; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">New Inquiry Submitted</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">A potential client has requested information regarding a project.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 35%; color: #475569;">Client Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email Address:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Phone Number:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Space / Surface Type:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${spaceType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Dimensions / Size:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${dimensions || "Not specified"}</td>
              </tr>
              ${
                designImageUrl
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Attached Design URL:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="${designImageUrl}" target="_blank" style="color: #2563eb; font-weight: bold;">View Design Mockup &rarr;</a></td>
              </tr>
              `
                  : ""
              }
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 13px; color: #475569; text-transform: uppercase;">Message / Details:</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1e293b; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Automated notification sent via Next.js Server Action & Resend API.
          </div>
        </div>
      `,
    });

    isSuccess = true;
  } catch (error: any) {
    console.error("Error processing submitInquiry action:", error);
    return {
      error: error.message || "An error occurred while sending your inquiry. Please try again.",
    };
  }

  // 5. Redirect: MUST be called outside the try/catch block
  // next/navigation redirect() throws a NEXT_REDIRECT error internally
  if (isSuccess) {
    redirect("/thank-you");
  }

  return {};
}
