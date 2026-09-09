"use client";

import React, { useRef } from "react";
import Head from "next/head";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

export default function TwoFactorAuthPage() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numeric input, although pattern/inputMode helps with mobile
    if (!/^[0-9]*$/.test(value)) {
      e.target.value = "";
      return;
    }

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <>
      <Head>
        <title>Verify it's you</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-white min-h-screen flex items-center justify-center p-4 antialiased text-gray-800">
        {/* VerificationContainer */}
        <main
          className="w-full max-w-[430px] min-h-[620px] bg-white border border-gray-200 rounded-[32px] px-8 sm:px-10 pt-12 pb-8 flex flex-col justify-between shadow-sm"
          data-purpose="auth-card"
        >
          {/* Top & Form Content */}
          <div>
            {/* CardHeader */}
            <div className="mb-5" data-purpose="header-section">
              <h1 className={`${playfair.className} text-[28px] leading-tight font-bold text-[#2d2d2d] mb-4`}>
                Verify it's you.
              </h1>
              <p className="text-[14px] leading-relaxed text-[#555555]">
                We just sent a six-digit code to your email address. Enter the code below to sign in.
              </p>
            </div>

            {/* VerificationForm */}
            <form
              action="#"
              className="mt-6"
              data-purpose="otp-form"
              id="verification-form"
              method="POST"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Input Group Label */}
              <label className="block text-[13px] text-[#4b5563] mb-2 font-normal">
                Activation Code
              </label>

              {/* 6-digit Code Inputs with Hyphen Divider */}
              <div className="flex items-center justify-between gap-1.5 mb-5" data-purpose="otp-inputs-wrapper">
                {/* First group (3 digits) */}
                {[0, 1, 2].map((idx) => (
                  <input
                    key={`otp-digit-${idx}`}
                    ref={setRef(idx)}
                    aria-label={`Digit ${idx + 1}`}
                    className="otp-digit w-[42px] h-[48px] text-center font-serif text-[20px] text-[#333333] border border-[#cfd4dc] rounded-[6px] focus:border-[#4b5563] focus:ring-0 focus:outline-none transition-colors"
                    data-purpose={`otp-digit-${idx + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    type="text"
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onClick={handleInputClick}
                  />
                ))}

                {/* Middle Divider Dash */}
                <span aria-hidden="true" className="text-gray-400 text-lg select-none px-0.5 font-sans font-light">
                  -
                </span>

                {/* Second group (3 digits) */}
                {[3, 4, 5].map((idx) => (
                  <input
                    key={`otp-digit-${idx}`}
                    ref={setRef(idx)}
                    aria-label={`Digit ${idx + 1}`}
                    className="otp-digit w-[42px] h-[48px] text-center font-serif text-[20px] text-[#333333] border border-[#cfd4dc] rounded-[6px] focus:border-[#4b5563] focus:ring-0 focus:outline-none transition-colors"
                    data-purpose={`otp-digit-${idx + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    type="text"
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onClick={handleInputClick}
                  />
                ))}
              </div>

              {/* Primary Action Button */}
              <button
                className="w-full bg-[#3d3d3d] hover:bg-[#2b2b2b] active:bg-[#1a1a1a] text-white font-serif font-bold text-[16px] tracking-wide py-3 px-4 rounded-[6px] transition-all duration-150 shadow-sm"
                data-purpose="submit-button"
                type="submit"
              >
                Continue
              </button>

              {/* Resend Code Prompt */}
              <p className="mt-4 text-[13px] text-[#555555]">
                Didn't receive the code?{" "}
                <a className="underline hover:text-black transition-colors font-medium" href="#">
                  Re-send.
                </a>
              </p>
            </form>
          </div>

          {/* CardFooter */}
          <footer className="text-center pt-8" data-purpose="card-footer">
            <a
              className="text-[13px] text-[#333333] underline hover:text-black transition-colors"
              data-purpose="back-link"
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
