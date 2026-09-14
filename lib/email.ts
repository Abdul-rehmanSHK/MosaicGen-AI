import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendOtpEmailParams {
  to: string;
  code: string;
}

export async function sendOtpVerificationEmail({ to, code }: SendOtpEmailParams) {
  console.log(`=======================================================`);
  console.log(`[EMAIL DISPATCH] ✉️  Sending 6-Digit OTP Code to: ${to}`);
  console.log(`[EMAIL DISPATCH] 🔐  Verification Code: ${code} (Expires in 5 minutes)`);
  console.log(`=======================================================`);

  // Option 1: Send via Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      const resend = new Resend(resendApiKey.trim());
      const fromEmail = process.env.RESEND_FROM || "MEC AI Mosaic <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `Your 6-Digit AI Studio Verification Code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #08080A; color: #FFFFFF; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #CBA741;">
            <h2 style="color: #CBA741; margin-top: 0; font-family: Georgia, serif;">MEC AI Mosaic Surface Studio</h2>
            <p style="font-size: 14px; color: #D1D5DB;">Thank you for designing with our AI surface engine. Use the verification code below to enter the AI image generation phase:</p>
            
            <div style="background-color: #121216; border: 1px solid #CBA741; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F5E08B; font-family: monospace;">${code}</span>
              <p style="font-size: 11px; color: #CBA741; margin-bottom: 0; margin-top: 8px; text-transform: uppercase;">Expires in 5 minutes</p>
            </div>
            
            <p style="font-size: 12px; color: #9CA3AF;">If you did not request this verification code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #262626; margin-top: 30px;" />
            <p style="font-size: 10px; color: #6B7280; text-align: center;">© 2026 MEC Artworks Studio. All Rights Reserved.</p>
          </div>
        `,
      });

      if (error) {
        console.error("[RESEND ERROR] ❌ Failed to dispatch via Resend:", error);
      } else {
        console.log(`[RESEND SUCCESS] ✅ Real email dispatched via Resend:`, data?.id);
        return { success: true, method: "resend" };
      }
    } catch (err: any) {
      console.error("[RESEND EXCEPTION] ❌", err.message);
    }
  }

  // Option 2: Send via Gmail / SMTP Nodemailer
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "abdd6965@gmail.com";
  const pass = process.env.SMTP_PASS;

  // If SMTP credentials are set in .env, send real email via Nodemailer
  if (user && pass && pass.trim().length > 0) {
    try {
      const cleanPass = pass.replace(/\s+/g, ""); // Automatically remove any spaces from Google App Password
      const isGmail = host.includes("gmail") || user.endsWith("@gmail.com");

      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: "gmail",
              auth: { user, pass: cleanPass },
            }
          : {
              host,
              port,
              secure: port === 465,
              auth: { user, pass: cleanPass },
            }
      );

      const mailOptions = {
        from: `"MEC AI Mosaic Studio" <${user}>`,
        to,
        subject: `Your 6-Digit AI Studio Verification Code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #08080A; color: #FFFFFF; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #CBA741;">
            <h2 style="color: #CBA741; margin-top: 0; font-family: Georgia, serif;">MEC AI Mosaic Surface Studio</h2>
            <p style="font-size: 14px; color: #D1D5DB;">Thank you for designing with our AI surface engine. Use the verification code below to enter the AI image generation phase:</p>
            
            <div style="background-color: #121216; border: 1px solid #CBA741; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F5E08B; font-family: monospace;">${code}</span>
              <p style="font-size: 11px; color: #CBA741; margin-bottom: 0; margin-top: 8px; text-transform: uppercase;">Expires in 5 minutes</p>
            </div>
            
            <p style="font-size: 12px; color: #9CA3AF;">If you did not request this verification code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #262626; margin-top: 30px;" />
            <p style="font-size: 10px; color: #6B7280; text-align: center;">© 2026 MEC Artworks Studio. All Rights Reserved.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SUCCESS] ✅  Real email successfully dispatched to ${to} from ${user}`);
      return { success: true, method: "smtp" };
    } catch (err: any) {
      console.error("[EMAIL SMTP ERROR] ❌ Failed to dispatch email:", err);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[EMAIL NOTICE] ℹ️  SMTP_PASS is empty in .env. Real email delivery requires a 16-character Google App Password in .env.`);
    return { success: true, method: "console" };
  }
}
