import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "T-rapy - Terapia Online",
  description: "Plataforma de saúde mental e bem-estar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
      >
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
