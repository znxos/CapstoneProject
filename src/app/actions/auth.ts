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
