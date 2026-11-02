import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/api/verify?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: "Capestone Project <onboarding@invertaxis.com>",
      to: [email],
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Please confirm your email address by clicking the link below. This link will expire in 2 hours.</p>
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
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: "Capestone Project <onboarding@invertaxis.com>",
      to: [email],
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the link below to choose a new one. This link will expire in 24 hours.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #444444; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Reset Password</a>
          <p style="margin-top: 24px; font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px;">Or copy and paste this link into your browser: <br/> ${resetLink}</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
