import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    template: "%s | HousingPortal",
    default: "HousingPortal — Property Intelligence",
  },
  description:
    "ML-powered property price estimation and market analysis platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`font-sans bg-slate-950 text-slate-100 antialiased`}
      >
        {/* Ambient background grid */}
        <div
          className="fixed inset-0 pointer-events-none bg-grid opacity-40"
          aria-hidden="true"
        />
        {/* Radial vignette */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,183,36,0.04) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <Navbar />

        <main className="relative pt-14 min-h-screen">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>

        <footer className="border-t border-slate-800/60 mt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600">
              HousingPortal v1.0
            </span>
            <span className="text-xs font-mono text-slate-700">
              ML · FastAPI · Spring Boot · Next.js
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}