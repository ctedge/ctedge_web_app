import Link from "next/link";
import Image from "next/image";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { EnquiryFab } from "@/components/enquiry-fab";
import { CurrentYear } from "@/components/current-year";
import { getCompanySettings } from "@/lib/company-settings";

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const { name: company, phone } = await getCompanySettings();
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            {/* <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white font-bold">{company.slice(0, 1)}</span>
            <span className="text-lg font-semibold text-slate-900">{company}</span> */}
            <Image src="/ctedgelogo.png" alt={`${company} logo`} width={120} height={36} className="h-9 w-auto" />
          </Link>
          <div className="text-sm">
            <a href={`tel:${phone}`} className="font-semibold text-teal-700 hover:underline">
              Call us
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
        &copy; <CurrentYear /> {company}. <Link href="/" className="hover:underline">Back to main site</Link>
      </footer>
      <EnquiryFab />
      <WhatsAppFab />
    </>
  );
}
