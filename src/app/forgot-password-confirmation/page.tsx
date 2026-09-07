import Head from "next/head";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

export default function ForgotPasswordConfirmationPage() {
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
              We have sent a password recovery instructions to your email address.
            </p>
            
            {/* Secondary Fallback / Resend Instructions */}
            <p
              className="text-[14.5px] leading-relaxed text-[#64686d]"
              data-purpose="secondary-notice"
            >
              Didn't receive the email? Check your spam folder or try to{" "}
              <a
                href="#"
                className="underline text-[#303336] hover:text-black transition-colors duration-150 decoration-1 underline-offset-2"
              >
                Re-send the message.
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
