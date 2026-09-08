import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalChatProvider } from "./providers/GlobalChatProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frontend Application",
  description: "Signup Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <GlobalChatProvider>
          {children}
        </GlobalChatProvider>
      </body>
    </html>
  );
}
