import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+234 800 000 0000";
  const email = process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "hello@example.com";
  const address = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "Lagos, Nigeria";
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000").replace(/[^\d]/g, "");
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const mapsSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="container-x py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Contact</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">Let&apos;s talk.</h1>
      <p className="mt-4 max-w-2xl text-slate-600">Send us a message, call, WhatsApp, or drop by our office.</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
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
                  <dt className="font-semibold text-slate-900">Address</dt>
                  <dd className="text-slate-600">{address}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Phone</dt>
                  <dd className="text-slate-600"><a href={`tel:${phone}`}>{phone}</a></dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Email</dt>
                  <dd className="text-slate-600"><a href={`mailto:${email}`}>{email}</a></dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">WhatsApp</dt>
                  <dd className="text-slate-600"><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp →</a></dd>
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
  );
}
