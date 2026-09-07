import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/api/verify?token=${token}`;

  // For local development when Resend is sandboxed, log the link to the terminal!
  console.log("=========================================");
  console.log("VERIFICATION EMAIL INTERCEPTED");
  console.log(`Click this link to verify: ${confirmLink}`);
  console.log("=========================================");

  try {
    const data = await resend.emails.send({
      from: "Capestone Project <onboarding@invertaxis.com>",
      to: [email],
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Please confirm your email address by clicking the link below. This link will expire in 24 hours.</p>
          <div style="margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #363636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px;">Or copy and paste this link into your browser: <br/> ${confirmLink}</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}
