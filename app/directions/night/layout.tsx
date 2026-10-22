import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "@/components/directions/editorial/editorial.css";
import "./night.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-ed" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-ed-serif" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · 5: Night" },
};

export default function NightLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-ed dir-night ${sans.variable} ${serif.variable}`}>{children}</div>;
}
