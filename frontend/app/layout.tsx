import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { ToastProvider } from "@/lib/toast-context";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const themeInitScript = `(function(){try{var t=localStorage.getItem('pulnazorat-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

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
  metadataBase: new URL("https://hamyonpro.uz"),
  title: "HamyonPro — Shaxsiy moliya",
  description:
    "HamyonPro — kirim va chiqimlaringizni oson kuzatish, byudjet, maqsad va qarzlarni boshqarish uchun shaxsiy moliya platformasi.",
  keywords: [
    "HamyonPro",
    "hamyonpro",
    "hamyonpro.uz",
    "hamyon pro",
    "shaxsiy moliya",
    "kirim chiqim",
    "byudjet",
    "moliyaviy kuzatuv",
    "pul nazorati",
  ],
  openGraph: {
    title: "HamyonPro — Shaxsiy moliya",
    description: "Kirim-chiqimingizni oson kuzating",
    url: "https://hamyonpro.uz",
    siteName: "HamyonPro",
    locale: "uz_UZ",
    type: "website",
  },
  alternates: {
    canonical: "https://hamyonpro.uz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f6faf7] font-sans text-slate-900 antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <Navbar />
                <div className="pb-20 sm:pb-0">{children}</div>
                <BottomNav />
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
