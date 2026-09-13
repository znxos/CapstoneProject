import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import React from "react";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    redirect("/login");
  }

  // We should fetch /api/auth/me to check isFirstLogin
  // But we can just rely on the API to return 403 or redirect
  // For now we'll just allow it since the backend will enforce onboarding if we add it,
  // or we can just fetch it here.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    if (!res.ok) {
      redirect("/login");
    }
    const user = await res.json();
    if (user.isFirstLogin) {
      redirect("/onboarding");
    }
  } catch (e) {
    // If backend is down, we might want to just proceed or error
  }

  return <>{children}</>;
}
