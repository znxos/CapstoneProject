"use server";
import { apiFetch } from "@/lib/api";

export async function requestPasswordReset(email: string) {
  console.log("--> [auth-engine] requestPasswordReset called with email:", email);
  try {
    const res = await apiFetch("/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    console.log("--> [auth-engine] response status:", res.status);
    
    if (!res.ok) {
      const data = await res.json();
      console.log("--> [auth-engine] error data:", data);
      return { error: data.detail || "Failed to send reset email." };
    }
    
    const data = await res.json();
    console.log("--> [auth-engine] success data from backend:", data);
    
    if (data.resend_status >= 400) {
      console.log("--> [auth-engine] RESEND FAILED! Reason:", data.resend_response);
    }
    
    return { success: true };
  } catch (error) {
    console.error("--> [auth-engine] fetch caught error:", error);
    return { error: "An unexpected error occurred while requesting a password reset." };
  }
}
