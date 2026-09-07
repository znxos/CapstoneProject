"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function signupUser(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { studentEmail: email.toLowerCase() }
  });

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const newUser = await prisma.user.create({
      data: {
        studentEmail: email.toLowerCase(),
        passwordHash,
      }
    });

    // Generate Verification Token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
      }
    });

    // Send the email via Resend
    await sendVerificationEmail(email.toLowerCase(), token);

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function resendVerificationEmailAction(email: string) {
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: email.toLowerCase() }
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.isVerified) {
      // Check 3-month rule
      if (user.lastVerifiedAt) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (user.lastVerifiedAt >= threeMonthsAgo) {
          return { error: "User is already verified" };
        }
      }
    }

    // Delete existing tokens for this email to prevent spam
    await prisma.verificationToken.deleteMany({
      where: { email: email.toLowerCase() }
    });

    // Generate new Verification Token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
      }
    });

    // Send the email via Resend
    await sendVerificationEmail(email.toLowerCase(), token);

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "Failed to resend verification email." };
  }
}

export async function requestPasswordReset(email: string) {
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: email.toLowerCase() }
    });

    if (!user) {
      // For security reasons, don't reveal if the user exists or not.
      // We return success either way.
      return { success: true };
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() }
    });

    // Generate new Reset Token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
      }
    });

    // Import and send the email
    const { sendPasswordResetEmail } = await import("@/lib/email");
    await sendPasswordResetEmail(email.toLowerCase(), token);

    return { success: true };
  } catch (error) {
    console.error("Request password reset error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { error: "Missing token or password" };
  }

  try {
    // Find the token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetRecord) {
      return { error: "Invalid or expired password reset link" };
    }

    if (new Date() > resetRecord.expiresAt) {
      return { error: "This password reset link has expired" };
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update the user
    await prisma.user.update({
      where: { studentEmail: resetRecord.email },
      data: { passwordHash }
    });

    // Delete the token so it can't be reused
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
