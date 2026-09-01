import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PulNazorat — Shaxsiy moliya",
  description: "Kirim-chiqimingizni oson kuzating",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f6faf7] font-sans text-slate-900 antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <div className="pb-20 sm:pb-0">{children}</div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
