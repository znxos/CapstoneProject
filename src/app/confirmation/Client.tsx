"use client";

import { useState } from "react";
import Head from "next/head";
import { Lora } from "next/font/google";
import { resendVerificationEmailAction } from "../actions/auth";

const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function ConfirmationClient({ email }: { email?: string }) {
  const [toastVisible, setToastVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email || isResending) return;

    setIsResending(true);
    
    // Call server action to resend the email
    await resendVerificationEmailAction(email);
    
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
      setIsResending(false);
    }, 4000);
  };

  return (
    <>
      <Head>
        <title>Check your email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="bg-[#fafafb] min-h-screen flex items-center justify-center p-4 antialiased text-[#404040]">
        <main className="w-full max-w-[430px] my-auto" data-purpose="email-verification-container">
          <section
            aria-labelledby="card-heading"
            className="bg-white border border-[#e5e7eb] rounded-[36px] shadow-card-subtle px-10 pt-16 pb-20 sm:px-12 transition-all"
            data-purpose="verification-card"
          >
            <h1
              id="card-heading"
              className={`${lora.className} tracking-[-0.015em] text-[1.75rem] font-bold text-[#333333] mb-8 leading-tight text-left`}
              data-purpose="page-title"
            >
              Check your email
            </h1>
            
            <p
              className="font-sans leading-[1.55] text-[0.9375rem] text-[#6b7280] mb-6 text-left"
              data-purpose="confirmation-notice"
            >
              We have sent you an account confirmation email to your student email address, please verify your account.
            </p>
            
            <p
              className="font-sans leading-[1.55] text-[0.9375rem] text-[#6b7280] mb-9 text-left"
              data-purpose="resend-instruction"
            >
              Didn't receive the email? Check your spam folder or try to{" "}
              <button
                type="button"
                id="resend-btn"
                className={`underline font-normal text-[#4b5563] hover:text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#374151] rounded transition-colors inline ${
                  isResending ? "opacity-50 pointer-events-none" : ""
                }`}
                data-purpose="resend-action"
                onClick={handleResend}
              >
                Re-send the message.
              </button>
            </p>
            {/* 
            <div className="mt-2" data-purpose="action-group">
              <a
                href="/login"
                className="block w-full py-3.5 px-6 text-center text-white bg-[#424242] hover:bg-[#303030] active:bg-[#202020] font-medium text-[0.975rem] rounded-lg tracking-normal transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#424242]"
                data-purpose="back-to-signin-button"
              >
                Go back to Sign In
              </a>
            </div>
            */}
            
            {/* Toast Feedback Message */}
            <div
              id="feedback-toast"
              role="status"
              aria-live="polite"
              className={`mt-4 p-2.5 text-center text-xs text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 transition-opacity duration-300 ${
                toastVisible ? "opacity-100 block" : "opacity-0 hidden"
              }`}
              data-purpose="interactive-feedback"
            >
              Confirmation email has been resent successfully.
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
