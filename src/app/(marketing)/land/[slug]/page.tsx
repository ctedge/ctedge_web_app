import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNGN, toNumber } from "@/lib/money";
import { ListingGallery } from "@/components/marketing/listing-gallery";
import { InspectionForm } from "@/components/forms/inspection-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicUrl } from "@/lib/r2-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCompanySettings } from "@/lib/company-settings";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const ls = await prisma.landListing.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return ls.map((l) => ({ slug: l.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await prisma.landListing.findUnique({ where: { slug } });
  if (!l) return {};
  const title = l.seoTitle ?? l.title;
  const description = l.seoDescription ?? `${l.title} — ${l.plotSizeSqm} sqm in ${l.location}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: l.ogImageKey ? [{ url: publicUrl(l.ogImageKey) }] : l.galleryKeys[0] ? [{ url: publicUrl(l.galleryKeys[0]) }] : undefined,
    },
  };
}

export default async function LandDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await prisma.landListing.findUnique({ where: { slug } });
  if (!listing || listing.status !== "PUBLISHED") notFound();

  const plans = (listing.paymentPlans as Array<{ months: number; deposit?: number; monthly?: number; label?: string }>) ?? [];
  const settings = await getCompanySettings();
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const mapsSrc = listing.mapLat != null && listing.mapLng != null
    ? mapsKey
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${listing.mapLat},${listing.mapLng}`
      : `https://www.google.com/maps?q=${listing.mapLat},${listing.mapLng}&output=embed`
    : listing.location
      ? mapsKey
        ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(listing.location)}`
        : `https://www.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/land/${listing.slug}`,
    description: listing.seoDescription ?? undefined,
    offers: {
      "@type": "Offer",
      price: toNumber(listing.priceOutright ?? listing.priceInstallment ?? 0),
      priceCurrency: "NGN",
    },
  };

  return (
    <div className="container-x py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-6 text-sm text-slate-500"><Link href="/land">← Back to land</Link></div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <ListingGallery imageKeys={listing.galleryKeys} title={listing.title} />
          <div>
            <Badge>Land</Badge>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">{listing.title}</h1>
            <p className="mt-2 text-slate-500">{listing.location}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              <span><strong>{listing.plotSizeSqm}</strong> sqm</span>
              {listing.priceOutright ? <span>Outright: <strong>{formatNGN(toNumber(listing.priceOutright))}</strong></span> : null}
              {listing.priceInstallment ? <span>Installment: <strong>{formatNGN(toNumber(listing.priceInstallment))}</strong></span> : null}
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Estate features</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {plans.length ? (
            <Card>
              <CardHeader><CardTitle>Payment plans</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map((p, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-4">
                      <div className="text-sm font-semibold text-teal-700">{p.label ?? `${p.months}-month plan`}</div>
                      {p.deposit ? <div className="mt-2 text-sm">Deposit: <strong>{formatNGN(p.deposit)}</strong></div> : null}
                      {p.monthly ? <div className="text-sm">Monthly: <strong>{formatNGN(p.monthly)}</strong></div> : null}
                      <div className="text-sm text-slate-500">Over {p.months} months</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {mapsSrc ? (
            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="p-0">
                <iframe src={mapsSrc} className="h-80 w-full" loading="lazy" title="Map" />
                {listing.mapLat != null && listing.mapLng != null ? (
                  <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                    <span>Coordinates: {listing.mapLat.toFixed(6)}, {listing.mapLng.toFixed(6)}</span>
                    <a
                      href={`https://www.google.com/maps?q=${listing.mapLat},${listing.mapLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      Open in Google Maps ↗
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {listing.brochureKey ? (
            <Link href={publicUrl(listing.brochureKey)} target="_blank">
              <Button variant="outline">Download brochure</Button>
            </Link>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Book inspection</CardTitle></CardHeader>
            <CardContent>
              <InspectionForm listingType="LAND" listingId={listing.id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-sm text-slate-600">
              Prefer WhatsApp?{" "}
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal-700 hover:underline"
              >
                Chat with us →
              </a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
