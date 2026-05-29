import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PrescribeFlow — Digital Prescription Platform",
    template: "%s | PrescribeFlow",
  },
  description:
    "Modern digital prescription management platform for healthcare professionals. Create, manage, and track prescriptions securely.",
  keywords: [
    "prescription",
    "healthcare",
    "digital",
    "management",
    "doctor",
    "patient",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
