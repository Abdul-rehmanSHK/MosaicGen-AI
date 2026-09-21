import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendOtpEmailParams {
  to: string;
  code: string;
}

function buildOtpEmailHtml(code: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #08080A; color: #FFFFFF; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #CBA741;">
      <h2 style="color: #CBA741; margin-top: 0; font-family: Georgia, serif;">Zakiah Mosaics Surface Studio</h2>
      <p style="font-size: 14px; color: #D1D5DB;">Thank you for designing with our architectural surface engine. Use the verification code below to enter the AI mosaic visualization phase:</p>

      <div style="background-color: #121216; border: 1px solid #CBA741; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F5E08B; font-family: monospace;">${code}</span>
        <p style="font-size: 11px; color: #CBA741; margin-bottom: 0; margin-top: 8px; text-transform: uppercase;">Expires in 5 minutes</p>
      </div>

      <p style="font-size: 12px; color: #9CA3AF;">If you did not request this verification code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #262626; margin-top: 30px;" />
      <p style="font-size: 10px; color: #6B7280; text-align: center;">© 2026 Zakiah Mosaics Studio. All Rights Reserved.</p>
    </div>
  `;
}

export async function sendOtpVerificationEmail({ to, code }: SendOtpEmailParams) {
  console.log(`[EMAIL DISPATCH] Sending 6-digit OTP to: ${to}`);

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  // Primary: Gmail SMTP via Nodemailer (when App Password is configured)
  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = parseInt(process.env.SMTP_PORT || "465", 10);
      const isGmail = host.includes("gmail") || smtpUser.endsWith("@gmail.com");

      const transporter = nodemailer.createTransport(
        isGmail
          ? { service: "gmail", auth: { user: smtpUser, pass: smtpPass } }
          : { host, port, secure: port === 465, auth: { user: smtpUser, pass: smtpPass } }
      );

      await transporter.sendMail({
        from: `"Zakiah Mosaics Studio" <${smtpUser}>`,
        to,
        subject: `Your 6-Digit AI Studio Verification Code: ${code}`,
        html: buildOtpEmailHtml(code),
      });

      console.log(`[EMAIL SUCCESS] OTP email sent to ${to} from ${smtpUser}`);
      return { success: true, method: "smtp" as const };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "SMTP send failed";
      console.error("[EMAIL SMTP ERROR]", message);
      return { success: false, error: message };
    }
  }

  // Fallback: Resend (only if SMTP is not configured)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM || "Zakiah Mosaics <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `Your 6-Digit AI Studio Verification Code: ${code}`,
        html: buildOtpEmailHtml(code),
      });

      if (error) {
        console.error("[RESEND ERROR]", error);
        return { success: false, error: "Failed to send verification email." };
      }

      console.log(`[RESEND SUCCESS] OTP email sent:`, data?.id);
      return { success: true, method: "resend" as const };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Resend send failed";
      console.error("[RESEND EXCEPTION]", message);
      return { success: false, error: message };
    }
  }

  // Dev fallback: no mail provider configured — code is returned in API response only
  console.log(`[EMAIL NOTICE] No SMTP credentials configured. Set SMTP_USER and SMTP_PASS in .env.local.`);
  return { success: true, method: "console" as const };
}
