import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/components/directions/document/document.css";
import "./studio.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-doc" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-doc-mono" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · 2: Studio" },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-doc doc-sparks dir-studio ${geist.variable} ${geistMono.variable}`}>{children}</div>;
}
