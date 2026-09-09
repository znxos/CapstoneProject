import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import React from "react";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { studentEmail: session.user.email },
    select: { isFirstLogin: true },
  });

  if (user && user.isFirstLogin === true) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
