import type { Metadata } from "next";
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "@/components/directions/document/document.css";
import "./prism.css";

const host = Host_Grotesk({ subsets: ["latin"], variable: "--font-doc" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-doc-mono" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · 4: Prism" },
};

export default function PrismLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-doc doc-sparks dir-prism ${host.variable} ${plexMono.variable}`}>{children}</div>;
}
