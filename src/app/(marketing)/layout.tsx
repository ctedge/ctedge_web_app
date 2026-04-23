import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "CT Edge";
  const address = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "Lagos, Nigeria";
  const phone = process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+234 800 000 0000";
  const email = process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "hello@example.com";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000";

  return (
    <>
      <SiteHeader company={company} />
      <main className="flex-1">{children}</main>
      <SiteFooter company={company} address={address} phone={phone} email={email} />
      <WhatsAppFab number={whatsapp} />
    </>
  );
}
