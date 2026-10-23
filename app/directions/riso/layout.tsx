import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./riso.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-riso" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-riso-mono" });

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · Direction C: Riso" },
};

export default function RisoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dir-riso ${archivo.variable} ${spaceMono.variable}`}>{children}</div>;
}
