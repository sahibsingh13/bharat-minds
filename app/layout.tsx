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
  title: "Bharat Minds - AI Chat Interface",
  description: "A modern AI chat interface that allows you to compare responses from multiple AI models simultaneously. Built with Next.js and featuring a beautiful modern design.",
  keywords: ["AI", "chat", "artificial intelligence", "Next.js", "TypeScript", "multi-model", "Gemini", "Llama"],
  authors: [{ name: "Sahib Singh" }],
  creator: "Sahib Singh",
  publisher: "Sahib Singh",
  robots: "index, follow",
  openGraph: {
    title: "Bharat Minds - AI Chat Interface",
    description: "Compare responses from multiple AI models with a beautiful modern interface",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat Minds - AI Chat Interface",
    description: "Compare responses from multiple AI models with a beautiful modern interface",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
