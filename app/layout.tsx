import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const stabil = localFont({
  src: [
    { path: "./fonts/StabilGrotesk-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/StabilGrotesk-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/StabilGrotesk-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/StabilGrotesk-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-stabil",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Superintelligent — Agent Readiness Audit",
    template: "%s — Superintelligent",
  },
  description:
    "The Agent Readiness Audit by Superintelligent: measure your organization's agentic maturity across six dimensions and get a roadmap to level up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${stabil.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
