// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* ===================== METADATA ===================== */

export const metadata: Metadata = {
  title: "DrawHub - Collaborate & Create",
  description:
    "Create, collaborate, and bring your ideas to life with our powerful drawing platform",
  keywords: ["drawing", "collaboration", "design", "team", "creative"],
  authors: [{ name: "DrawHub Team" }],
};

/* ===================== VIEWPORT ===================== */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

/* ===================== ROOT LAYOUT ===================== */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}