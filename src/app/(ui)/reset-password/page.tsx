import { redirect } from "next/navigation";
import ResetPasswordClient from "./Client";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenParam = searchParams.token;

  if (!tokenParam || typeof tokenParam !== "string") {
    redirect("/login");
  }

  // Real validation happens on submission.
  return <ResetPasswordClient token={tokenParam} />;
}
