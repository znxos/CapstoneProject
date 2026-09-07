"use client";

import { useState } from "react";
import Head from "next/head";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

export default function ResetPasswordPage() {
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <>
      <Head>
        <title>Reset Password</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-[#2D3139]">
        {/* ResetPasswordCard */}
        <main
          className="w-full max-w-[420px] bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-8 pt-10 pb-10 flex flex-col justify-between"
          style={{ minHeight: "590px" }}
        >
          {/* Top Content Section */}
          <div>
            {/* Header: Title & Subtext */}
            <header className="mb-6">
              <h1 className={`${playfair.className} text-[26px] font-bold tracking-tight text-[#2B2D31] mb-3 leading-snug`}>
                New password
              </h1>
              <p className="text-[13.5px] leading-[1.5] text-[#6B7280]">
                Your new password must be different from previously used one, and must have at least 8 characters.
              </p>
            </header>

            {/* Password Reset Form */}
            <form className="space-y-4" id="reset-password-form" onSubmit={(e) => e.preventDefault()}>
              {/* Field 1: New Password */}
              <div className="space-y-1.5" data-purpose="form-field-group">
                <label className="block text-[13px] font-medium text-[#4B5563]" htmlFor="new-password">
                  New password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:ring-1 focus:ring-[#444444] focus:border-[#444444] outline-none transition-colors"
                    id="new-password"
                    name="new-password"
                    placeholder="••••••••••••"
                    required
                    type={newPasswordVisible ? "text" : "password"}
                    defaultValue="secretpassword"
                  />
                  <button
                    aria-label="Toggle new password visibility"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors focus:outline-none"
                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                    type="button"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                      {newPasswordVisible ? (
                        <>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                        </>
                      ) : (
                        <>
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Field 2: Confirm Password */}
              <div className="space-y-1.5" data-purpose="form-field-group">
                <label className="block text-[13px] font-medium text-[#4B5563]" htmlFor="confirm-password">
                  Confirm password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:ring-1 focus:ring-[#444444] focus:border-[#444444] outline-none transition-colors"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="••••••••••••"
                    required
                    type={confirmPasswordVisible ? "text" : "password"}
                    defaultValue="secretpassword"
                  />
                  <button
                    aria-label="Toggle confirm password visibility"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors focus:outline-none"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    type="button"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                      {confirmPasswordVisible ? (
                        <>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                        </>
                      ) : (
                        <>
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  className="w-full py-2.5 px-4 bg-[#444444] hover:bg-[#333333] active:bg-[#222222] text-white font-medium text-sm rounded-lg transition duration-150 shadow-sm flex items-center justify-center font-serif tracking-wide"
                  type="submit"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Action Section */}
          <footer className="mt-8 text-center" data-purpose="navigation-footer">
            <a
              className="text-[13px] font-normal text-[#374151] underline underline-offset-4 hover:text-[#111827] transition-colors"
              href="/login"
            >
              Go back to Sign In.
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
