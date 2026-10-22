import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./studio.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-studio" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-studio-mono" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · Direction B: Studio" },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-studio ${geist.variable} ${geistMono.variable}`}>{children}</div>;
}
