import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getCompanySettings } from "@/lib/company-settings";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { name, address, phone, email, whatsapp } = await getCompanySettings();

  return (
    <>
      <SiteHeader company={name} />
      <main className="flex-1">{children}</main>
      <SiteFooter company={name} address={address} phone={phone} email={email} />
      <WhatsAppFab number={whatsapp} />
    </>
  );
}
