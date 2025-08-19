import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Bharat Minds - AI Chat",
  description: "Simple, clean, GPT-like chat experience with multi-model compare.",
  keywords: ["AI", "chat", "LLM", "Next.js", "TypeScript", "compare", "models"],
  authors: [{ name: "Sahib Singh" }],
  creator: "Sahib Singh",
  publisher: "Sahib Singh",
  robots: "index, follow",
  openGraph: {
    title: "Bharat Minds - AI Chat",
    description: "Compare responses from multiple AI models with a simple, clean interface",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat Minds - AI Chat",
    description: "Compare responses from multiple AI models with a simple, clean interface",
    creator: "@sahibsingh13",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
      >
        {children}
      </body>
    </html>
  );
}
