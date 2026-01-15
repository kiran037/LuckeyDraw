import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Using Inter as the primary font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* ===================== METADATA ===================== */

export const metadata: Metadata = {
  title: {
    default: "Sawariya - Lucky Draw",
    template: "%s | Sawariya",
  },
  description: "Join the most exciting lucky draws and win big prizes.",
  keywords: ["lucky draw", "contest", "prizes", "sawariya", "win"],
  authors: [{ name: "Sawariya Team" }],
  icons: {
    icon: "/favicon.ico", // Ensure you have a favicon
  },
};

/* ===================== VIEWPORT ===================== */
// Matches the background color to the browser chrome (address bar)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zooming issues on inputs in iOS
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" }, // gray-50
    { media: "(prefers-color-scheme: dark)", color: "#0B0E14" }, // Your specific dark bg
  ],
};

/* ===================== ROOT LAYOUT ===================== */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is needed for next-themes
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body 
        className="
          antialiased font-sans 
          min-h-screen 
          bg-gray-50 text-gray-900 
          dark:bg-[#0B0E14] dark:text-gray-100 
          transition-colors duration-300 selection:bg-purple-500/30
        "
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}