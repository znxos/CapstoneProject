import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import React from "react";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let shouldRedirect = "";
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
      cache: 'no-store'
    });
    if (!res.ok) {
      shouldRedirect = "/login";
    } else {
      const user = await res.json();
      if (user.isFirstLogin === false) {
        shouldRedirect = "/events";
      }
    }
  } catch (e) {
    //
  }

  if (shouldRedirect) {
    redirect(shouldRedirect);
  }

  return <>{children}</>;
}
