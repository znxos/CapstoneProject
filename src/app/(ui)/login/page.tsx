"use client";

import { useState, Suspense } from "react";
import Head from "next/head";
import { Merriweather } from "next/font/google";
import { apiFetch } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get("verified") === "true";
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(isVerified ? "Account successfully verified! Please log in." : null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: form
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Invalid email or password");
        } else {
          setError("An error occurred during login.");
        }
        setIsLoading(false);
      } else {
        const data = await res.json();
        Cookies.set('access_token', data.access_token, { expires: 7 }); // expires in 7 days
        router.push("/events");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans antialiased text-gray-800">
        <main
          className="w-full max-w-[440px] bg-white rounded-[32px] border border-[#e5e7eb] shadow-sm px-10 py-12 flex flex-col justify-between min-h-[660px]"
          data-purpose="auth-card"
        >
          <div>
            <header className="mb-6" data-purpose="auth-header">
              <h1 className={`${merriweather.className} font-bold text-[32px] text-charcoal-dark tracking-normal mb-3`}>
                Sign in
              </h1>
              <p className="text-subtext text-[15px] leading-relaxed max-w-[280px]">
                Log in by entering your email address and password.
              </p>
            </header>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-[14px] rounded-lg border border-red-100 flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-[14px] rounded-lg border border-green-200 flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {success}
              </div>
            )}

            <form method="POST" className="space-y-4" data-purpose="login-form" onSubmit={handleSubmit}>
              {/* Email Input Group */}
              <div className="space-y-1.5" data-purpose="input-group-email">
                <label className="block text-[14px] text-subtext font-normal" htmlFor="email">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subtext">
                    {/* Envelope Icon */}
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal text-[15px]"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@address.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              {/* Password Input Group */}
              <div className="space-y-1.5" data-purpose="input-group-password">
                <label className="block text-[14px] text-subtext font-normal" htmlFor="password">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subtext">
                    {/* Lock Icon */}
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal text-[15px] tracking-widest"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    type={passwordVisible ? "text" : "password"}
                    required
                  />
                  {/* Toggle Visibility Button */}
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9ca3af] hover:text-gray-600 focus:outline-none"
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {passwordVisible ? (
                        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <>
                          <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="pt-0.5 pb-2">
                <a className="text-[14px] text-[#444444] underline hover:text-black font-normal transition-colors" href="/forgot-password">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  className={`w-full text-white font-semibold py-3 px-4 rounded-lg text-[16px] transition duration-150 ease-in-out shadow-sm flex items-center justify-center ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#444444] hover:bg-[#333333]"
                  }`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Log in"
                  )}
                </button>
              </div>

              {/* Remember Me Switch Toggle */}
              <div className="flex items-center space-x-3 pt-2">
                <div className="relative inline-block w-9 h-5 align-middle select-none transition duration-200 ease-in">
                  <input
                    className="peer absolute block w-5 h-5 rounded-full bg-white border-2 border-[#cbd5e1] appearance-none cursor-pointer focus:outline-none focus:ring-0 shadow-sm transition-transform duration-200 ease-in-out checked:translate-x-4 checked:border-black checked:bg-white checked:bg-none z-10"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                  />
                  <label className="block overflow-hidden h-5 rounded-full bg-[#cbd5e1] cursor-pointer peer-checked:bg-black transition-colors duration-200" htmlFor="remember-me"></label>
                </div>
                <label className="text-[14px] text-subtext cursor-pointer select-none" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
            </form>
          </div>

          <footer className="text-center pt-8" data-purpose="auth-footer">
            <p className="text-[14px] text-subtext">
              Don't have an account?{" "}
              <a className="text-[#444444] underline hover:text-black font-normal transition-colors" href="/signup">
                Sign up here
              </a>
            </p>
          </footer>
        </main>
      </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign in</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Suspense fallback={<div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </>
  );
}
