import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDentry - わたしのすべてが、このIDに。",
  description: "SNSリンク、スキル、経歴、ポートフォリオ。あなたの\"ぜんぶ\"を、ひとつのページにまとめよう。",
  icons: {
    icon: "/img/favicon.png",
    shortcut: "/img/favicon.png",
    apple: "/img/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar
            config={{
              plugins: [],
            }}
          />
        )}
        {children}
      </body>
    </html>
  );
}
