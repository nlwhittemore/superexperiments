import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "@/components/directions/editorial/editorial.css";
import "./paper.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-ed" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · 1: Paper" },
};

export default function PaperLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-ed dir-paper ${hanken.variable}`}>{children}</div>;
}
