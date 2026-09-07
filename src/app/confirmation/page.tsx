import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ConfirmationClient from "./Client";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const emailParam = searchParams.email;

  // 1. Must have an email query parameter
  if (!emailParam || typeof emailParam !== "string") {
    redirect("/login");
  }

  // 2. The email must actually exist in the database and be unverified
  const user = await prisma.user.findUnique({
    where: { studentEmail: emailParam.toLowerCase() },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.isVerified) {
    // If they are already verified, check the 3-month rule
    if (user.lastVerifiedAt) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      // If their last verification was less than 3 months ago, they don't need to be here
      if (user.lastVerifiedAt >= threeMonthsAgo) {
        redirect("/login?verified=true");
      }
    }
  }

  return <ConfirmationClient email={emailParam as string} />;
}
