import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanySettings } from "@/lib/company-settings";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getCompanySettings();
  const phone = settings.phone;
  const email = settings.email;
  const address = settings.address;
  const whatsapp = settings.whatsapp.replace(/[^\d]/g, "");
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const mapsSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk." description="Send us a message, call, WhatsApp, or drop by our office." />
      <div className="container-x py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Send a message</CardTitle></CardHeader>
          <CardContent>
            <LeadForm source="contact-page" interestPlaceholder="What can we help with?" submitLabel="Send message" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="py-6">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900"><MapPin className="h-4 w-4 text-teal-700" />Address</dt>
                  <dd className="mt-1 ml-6 text-slate-600">{address}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900"><Phone className="h-4 w-4 text-teal-700" />Phone</dt>
                  <dd className="mt-1 ml-6 text-slate-600"><a href={`tel:${phone}`}>{phone}</a></dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900"><Mail className="h-4 w-4 text-teal-700" />Email</dt>
                  <dd className="mt-1 ml-6 text-slate-600"><a href={`mailto:${email}`}>{email}</a></dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900"><MessageCircle className="h-4 w-4 text-teal-700" />WhatsApp</dt>
                  <dd className="mt-1 ml-6 text-slate-600"><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp →</a></dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <iframe src={mapsSrc} className="h-80 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office map" />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
