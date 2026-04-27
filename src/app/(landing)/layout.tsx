import Link from "next/link";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "CT EDGE";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000";
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            {/* <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white font-bold">{company.slice(0, 1)}</span>
            <span className="text-lg font-semibold text-slate-900">{company}</span> */}
            <img src="/ctedgelogo.png" alt={`${company} logo`} className="h-9 w-auto" />
          </Link>
          <div className="text-sm">
            <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE ?? ""}`} className="font-semibold text-teal-700 hover:underline">
              Call us
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} {company}. <Link href="/" className="hover:underline">Back to main site</Link>
      </footer>
      <WhatsAppFab number={whatsapp} />
    </>
  );
}
