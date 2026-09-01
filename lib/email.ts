import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  to: string;
  code: string;
}

export async function sendOtpVerificationEmail({ to, code }: SendOtpEmailParams) {
  // Check if SMTP environment variables are configured
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`=======================================================`);
  console.log(`[EMAIL DISPATCH] ✉️  Sending 6-Digit OTP Code to: ${to}`);
  console.log(`[EMAIL DISPATCH] 🔐  Verification Code: ${code} (Expires in 5 minutes)`);
  console.log(`=======================================================`);

  // If SMTP credentials are set in .env, send real email via Nodemailer
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

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
      console.log(`[EMAIL SUCCESS] ✅  Real email successfully dispatched to ${to}`);
      return { success: true, method: "smtp" };
    } catch (err: any) {
      console.error("[EMAIL SMTP ERROR] ❌ Failed to dispatch email:", err);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[EMAIL NOTICE] ℹ️  SMTP credentials not set in .env (SMTP_USER / SMTP_PASS). Code logged above to console.`);
    return { success: true, method: "console" };
  }
}
