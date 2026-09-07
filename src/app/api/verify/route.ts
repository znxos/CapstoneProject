import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const verification = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Mark user as verified and update timestamp
    await prisma.user.update({
      where: { studentEmail: verification.email },
      data: {
        isVerified: true,
        lastVerifiedAt: new Date(),
      }
    });

    // Delete token so it can't be reused
    await prisma.verificationToken.delete({
      where: { id: verification.id }
    });

    // Redirect to login with success message
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
