import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kabu-app — 株式セクター分析 & バリュー株スクリーナー",
  description:
    "米国株・日本株のセクター資金流入を可視化し、バリュー株を自動でピックアップするダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] text-[var(--muted)] text-xs px-6 py-4 text-center">
          データは投資助言ではありません。サンプル/非公式データを含みます。投資判断はご自身の責任で。
        </footer>
      </body>
    </html>
  );
}
