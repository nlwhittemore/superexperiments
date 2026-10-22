import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "@/components/directions/editorial/editorial.css";
import "./mono.css";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-ed" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · 3: Mono" },
};

export default function MonoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-ed dir-mono ${interTight.variable}`}>{children}</div>;
}
