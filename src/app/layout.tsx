import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study Program Planner",
  description: "A dynamic and interactive study program planner for exam preparation",
  openGraph: {
    title: 'Study Program Planner',
    description: 'A dynamic and interactive study program planner for exam preparation',
    url: 'https://study-program-pi.vercel.app/',
    siteName: 'Study Program Planner',
    images: [
      {
        url: 'https://study-program-pi.vercel.app/api/og?title=Study Program Planner',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <AuthProvider>
        <DarkModeProvider>
          <body className={inter.className}>
            {children}
            <SpeedInsights />
            <Analytics />
          </body>
        </DarkModeProvider>
      </AuthProvider>
    </html>
  );
}