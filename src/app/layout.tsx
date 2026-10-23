import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Moto Táxi Millênio",
  description: "Chame um moto-táxi em Avaré/SP. Tradição e confiança em todos os destinos!",
};

export const viewport: Viewport = { themeColor: "#0b5d1e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${barlow.variable} antialiased`}>{children}</body>
    </html>
  );
}
