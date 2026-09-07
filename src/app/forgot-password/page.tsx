"use client";

import Head from "next/head";
import { Merriweather } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "../actions/auth";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700"] });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/forgot-password-confirmation?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Head>
        <title>Forgot Password</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6 antialiased font-sans text-gray-800">
        <main
          className="w-full max-w-[460px] bg-white rounded-[28px] border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-8 py-12 sm:px-11 sm:py-14 flex flex-col justify-between min-h-[640px]"
          data-purpose="forgot-password-card"
        >
          {/* Top Content Area (Header, Description & Form) */}
          <div className="w-full">
            {/* Title */}
            <h1
              className={`${merriweather.className} tracking-[-0.015em] text-[28px] sm:text-[30px] font-bold text-brand-title mb-4 leading-tight`}
            >
              Forgot password?
            </h1>
            
            {/* Informative Subtext */}
            <p className="text-[15px] sm:text-[15.5px] leading-relaxed text-brand-textMuted mb-8 font-normal max-w-[340px]">
              Enter your email and we'll send you a link to reset your password.
            </p>
            
            {/* Reset Form */}
            <form
              className="space-y-5"
              data-purpose="reset-request-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {error}
                </div>
              )}
              {/* Input Field Container */}
              <div className="space-y-1.5">
                <label className="block text-[14px] font-normal text-gray-700" htmlFor="email">
                  Email address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  {/* Mail Icon Prefix */}
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  {/* Email Input Field */}
                  <input
                    className="block w-full pl-10 pr-3.5 py-2.5 text-[15px] rounded-lg border border-brand-inputBorder placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 transition-colors"
                    id="email"
                    name="email"
                    placeholder="email@address.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-1">
                <button
                  className={`w-full py-3 px-4 bg-[#444444] hover:bg-[#2e2e2e] active:bg-[#1a1a1a] text-white text-[15.5px] font-medium rounded-lg transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  data-purpose="submit-button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* CardFooterNavigation */}
          <div className="w-full pt-10 text-center" data-purpose="back-navigation">
            <a
              className="inline-block text-[14.5px] font-normal text-gray-700 underline underline-offset-4 decoration-gray-400 hover:decoration-gray-700 hover:text-gray-900 transition-all duration-150"
              href="/login"
            >
              Go back to Sign In.
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
