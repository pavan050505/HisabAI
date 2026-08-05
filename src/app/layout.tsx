import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HisabAI",
  description: "Smart business. Simple hisab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}