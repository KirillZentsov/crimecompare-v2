import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrimeCompare — Compare crime rates between UK postcodes",
  description: "Compare crime rates, risk scores, and trends between any two UK postcodes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MotionConfig reducedMotion="user">
          <QueryProvider>{children}</QueryProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
