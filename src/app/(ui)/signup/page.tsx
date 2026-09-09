"use client";

import { useState } from "react";
import Head from "next/head";
import { signupUser } from "@/app/actions/auth-engine";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [domainInfo, setDomainInfo] = useState<{message: string, isError: boolean} | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.includes("@")) {
      const domain = value.split("@")[1].toLowerCase();
      const validDomains = ["mycput.ac.za", "myuct.ac.za", "myuwc.ac.za", "student.sun.ac.za"];
      
      if (validDomains.includes(domain)) {
        setDomainInfo({ message: "Verified Student Email", isError: false });
      } else if (domain.includes(".")) {
        setDomainInfo({ message: "Please use your university student email.", isError: true });
      } else {
        setDomainInfo(null);
      }
    } else {
      setDomainInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (domainInfo?.isError) {
      setError("Please use a valid university email.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create the user in the database
      const result = await signupUser(email, password);
      
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // 2. Redirect to confirmation page
      window.location.href = `/confirmation?email=${encodeURIComponent(email)}`;

    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Your Account</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 antialiased text-gray-800">
        <main
          className="w-full max-w-[430px] bg-white rounded-4xl p-8 sm:p-10 card-shell transition-all"
          data-purpose="signup-card-container"
        >
          <header className="text-center pt-2 pb-7">
            <h1 className="text-2xl sm:text-[27px] font-bold text-charcoal-heading tracking-tight">
              Create Your Account
            </h1>
          </header>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <form method="POST" className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Address Field */}
            <div data-purpose="input-group-email">
              <label
                className="block text-[13px] font-normal text-neutral-label mb-1.5 ml-0.5"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-icon">
                  <svg
                    className="w-5 h-5 text-gray-500 stroke-[1.6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <input
                  className={`w-full pl-11 pr-11 py-2.5 rounded-lg border ${
                    domainInfo?.isError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-[#c4c7cc] focus:ring-charcoal focus:border-charcoal'
                  } text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 text-[15px] transition`}
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="email@address.com"
                  required
                  type="email"
                />
                {domainInfo && !domainInfo.isError && (
                  <div className="absolute right-3.5 flex items-center pointer-events-none text-green-500" title={domainInfo.message}>
                    <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
              {domainInfo?.isError && (
                <p className="text-[12px] mt-1.5 ml-0.5 font-medium text-red-500">
                  {domainInfo.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div data-purpose="input-group-password">
              <label
                className="block text-[13px] font-normal text-neutral-label mb-1.5 ml-0.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-icon">
                  <svg
                    className="w-5 h-5 text-gray-500 stroke-[1.6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <input
                  className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal text-[15px] tracking-widest transition"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  type={passwordVisible ? "text" : "password"}
                />
                <button
                  aria-label="Toggle password visibility"
                  className={`absolute right-3.5 flex items-center focus:outline-none ${
                    passwordVisible ? "text-gray-700" : "text-gray-400 hover:text-gray-600"
                  }`}
                  data-purpose="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  type="button"
                >
                  <svg
                    className="w-5 h-5 stroke-[1.6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div data-purpose="input-group-confirm-password">
              <label
                className="block text-[13px] font-normal text-neutral-label mb-1.5 ml-0.5"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-icon">
                  <svg
                    className="w-5 h-5 text-gray-500 stroke-[1.6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <input
                  className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal text-[15px] tracking-widest transition"
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  type={confirmPasswordVisible ? "text" : "password"}
                />
                <button
                  aria-label="Toggle confirm password visibility"
                  className={`absolute right-3.5 flex items-center focus:outline-none ${
                    confirmPasswordVisible ? "text-gray-700" : "text-gray-400 hover:text-gray-600"
                  }`}
                  data-purpose="toggle-confirm-password"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  type="button"
                >
                  <svg
                    className="w-5 h-5 stroke-[1.6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Update Notifications Checkbox */}
            <div className="pt-1 flex items-center" data-purpose="checkbox-updates">
              <input
                className="w-4 h-4 rounded border-gray-400 text-charcoal focus:ring-0 focus:ring-offset-0 cursor-pointer"
                id="newsletter"
                name="newsletter"
                type="checkbox"
              />
              <label
                className="ml-2.5 text-xs text-neutral-label select-none cursor-pointer leading-none"
                htmlFor="newsletter"
              >
                Receive news, and platform updates
              </label>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-3" data-purpose="submit-action">
              <button
                disabled={domainInfo?.isError || email === "" || isLoading}
                className={`w-full py-3 px-4 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal transition duration-150 ease-in-out flex items-center justify-center ${
                  domainInfo?.isError || email === "" || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-charcoal hover:bg-charcoal-hover"
                }`}
                type="submit"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Legal Agreement Disclaimer */}
            <p
              className="text-[12px] leading-snug text-neutral-label text-left pt-0.5"
              data-purpose="terms-disclaimer"
            >
              By creating an account, you are agree to the{" "}
              <a className="text-charcoal hover:underline" href="#terms">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-charcoal hover:underline" href="#privacy">
                Privacy Policy
              </a>
              .
            </p>
          </form>

          <footer
            className="mt-8 pt-2 text-center text-xs text-neutral-label border-t border-transparent"
            data-purpose="login-link-container"
          >
            Already have an account?{" "}
            <a className="text-charcoal-heading font-medium hover:underline" href="/login">
              Log in here
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
