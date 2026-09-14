import { redirect } from "next/navigation";
import ResetPasswordClient from "./Client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const tokenParam = resolvedParams?.token;
  
  console.log("--> [reset-password/page.tsx] searchParams:", resolvedParams);

  if (!tokenParam || typeof tokenParam !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-4">The password reset link is invalid or missing the security token.</p>
          <p className="text-gray-400 text-sm mb-4">Debug Params: {JSON.stringify(resolvedParams)}</p>
          <a href="/forgot-password" className="text-blue-500 hover:underline">Request a new link</a>
        </div>
      </div>
    );
  }

  // Real validation happens on submission.
  return <ResetPasswordClient token={tokenParam} />;
}
