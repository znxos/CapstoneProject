import { redirect } from "next/navigation";
import ConfirmationClient from "./Client";

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const emailParam = searchParams.email;

  if (!emailParam || typeof emailParam !== "string") {
    redirect("/login");
  }

  // The backend verification will be triggered by ConfirmationClient
  return <ConfirmationClient email={emailParam as string} />;
}
