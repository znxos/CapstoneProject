"use client";

import { useState } from "react";
import { Merriweather } from "next/font/google";
import { requestPasswordReset } from "@/app/actions/auth-engine";
import Head from "next/head";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

export default function ForgotPasswordConfirmationClient({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address not found. Please go back and try again.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage("Recovery email resent successfully!");
      }
    } catch (err) {
      setError("An unexpected error occurred while resending the email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Check your email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-white min-h-screen flex items-center justify-center p-4 sm:p-6 text-gray-800 antialiased selection:bg-gray-100 selection:text-gray-900 font-sans">
        <main className="w-full flex items-center justify-center py-10" data-purpose="page-wrapper">
          <div
            className="auth-card bg-white px-10 pt-16 pb-12 flex flex-col justify-start"
            data-purpose="auth-status-container"
          >
            {/* Primary Heading */}
            <h1
              className={`${merriweather.className} tracking-[-0.01em] text-[28px] leading-tight font-bold text-[#303336] mb-8`}
              data-purpose="screen-title"
            >
              Check your email
            </h1>
            
            {/* Primary Notification Text */}
            <p
              className="text-[14.5px] leading-relaxed text-[#64686d] mb-6"
              data-purpose="primary-message"
            >
              We have sent password recovery instructions to {email ? <strong className="text-[#303336] font-medium">{email}</strong> : "your email address"}.
            </p>
            
            {/* Secondary Fallback / Resend Instructions */}
            <p
              className="text-[14.5px] leading-relaxed text-[#64686d]"
              data-purpose="secondary-notice"
            >
              Didn't receive the email? Check your spam folder or try to{" "}
              {isSubmitting ? (
                <span className="text-gray-400">resend...</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isSubmitting || !email}
                  className="underline text-[#303336] hover:text-black transition-colors duration-150 decoration-1 underline-offset-2"
                >
                  Re-send the message.
                </button>
              )}
            </p>
            
            {/* Feedback Messages */}
            {message && (
              <div className="mt-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="w-full pt-10 mt-2 border-t border-gray-100 text-center">
              <a
                className="inline-block text-[14.5px] font-normal text-gray-700 underline underline-offset-4 decoration-gray-400 hover:decoration-gray-700 hover:text-gray-900 transition-all duration-150"
                href="/login"
              >
                Go back to Sign In.
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
