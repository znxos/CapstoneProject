import ForgotPasswordConfirmationClient from "./Client";
import { redirect } from "next/navigation";

export default async function ForgotPasswordConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const resolvedParams = await searchParams;
  const email = resolvedParams.email;

  if (!email || typeof email !== 'string') {
    redirect("/login");
  }

  return <ForgotPasswordConfirmationClient email={email} />;
}
