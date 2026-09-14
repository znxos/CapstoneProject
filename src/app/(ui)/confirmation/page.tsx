import { redirect } from "next/navigation";
import ConfirmationClient from "./Client";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const emailParam = resolvedParams?.email;

  if (!emailParam || typeof emailParam !== "string") {
    redirect("/login");
  }

  return <ConfirmationClient email={emailParam} />;
}
