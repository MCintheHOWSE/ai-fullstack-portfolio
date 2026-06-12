import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Week 01 Todo App",
  description: "AI-assisted Todo app with localStorage persistence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
