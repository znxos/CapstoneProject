import ForgotPasswordConfirmationClient from "./Client";

export default function ForgotPasswordConfirmationPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email || "";

  return <ForgotPasswordConfirmationClient email={email} />;
}
