import { redirect } from "next/navigation";
import ResetPasswordClient from "./Client";
import prisma from "@/lib/prisma";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenParam = searchParams.token;

  if (!tokenParam || typeof tokenParam !== "string") {
    redirect("/login");
  }

  // Validate the token exists and isn't expired
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token: tokenParam },
  });

  if (!resetRecord || new Date() > resetRecord.expiresAt) {
    redirect("/login?error=invalid_reset_token");
  }

  return <ResetPasswordClient token={tokenParam} />;
}
