"use client";

import Head from "next/head";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

export default function ResetPasswordConfirmationClient() {
  return (
    <>
      <Head>
        <title>Password Reset Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-[#fafafa] min-h-screen flex items-center justify-center p-4 sm:p-6 text-gray-800 antialiased font-sans">
        <main className="w-full max-w-[460px] bg-white rounded-[28px] border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-8 py-12 sm:px-11 sm:py-14 flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className={`${merriweather.className} text-[26px] font-bold text-gray-900 mb-4`}>
            Password Reset
          </h1>
          
          <p className="text-[15px] text-gray-600 mb-8 max-w-[300px]">
            Your password has been successfully reset. You can now use your new password to log in.
          </p>
          
          <a
            href="/login"
            className="w-full py-3 px-4 bg-[#444444] hover:bg-[#2e2e2e] text-white text-[15.5px] font-medium rounded-lg transition duration-150 shadow-sm flex justify-center items-center"
          >
            Go to Login
          </a>
        </main>
      </div>
    </>
  );
}
