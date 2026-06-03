import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "CT EDGE";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company} — Real Estate, Construction & Investment`,
    template: `%s · ${company}`,
  },
  description:
    "Premium land and housing, construction services, and real estate investment opportunities. Secure payments, transparent processes, long-term value.",
  openGraph: {
    type: "website",
    siteName: company,
    title: company,
    description: "Real estate, construction, and investment solutions.",
  },
  twitter: {
    card: "summary_large_image",
    title: company,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
