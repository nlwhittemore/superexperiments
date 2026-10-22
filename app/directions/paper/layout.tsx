import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./paper.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-paper",
});

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · Direction A: Paper & Sun" },
};

export default function PaperLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-paper ${hanken.variable}`}>{children}</div>;
}
