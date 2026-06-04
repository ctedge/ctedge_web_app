import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNGN, toNumber } from "@/lib/money";
import { ListingGallery } from "@/components/marketing/listing-gallery";
import { InspectionForm } from "@/components/forms/inspection-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicUrl } from "@/lib/r2-client";
import { reserveListing } from "@/server/actions/purchases";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const hs = await prisma.housingListing.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return hs.map((h) => ({ slug: h.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const h = await prisma.housingListing.findUnique({ where: { slug } });
  if (!h) return {};
  const title = h.seoTitle ?? h.title;
  const description = h.seoDescription ?? `${h.title} in ${h.location}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: h.galleryKeys[0] ? [{ url: publicUrl(h.galleryKeys[0]) }] : undefined,
    },
  };
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if ((u.hostname === "www.youtube.com" || u.hostname === "youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {}
  return url;
}

type TipTapNode = { type: string; text?: string; content?: TipTapNode[] };

function renderBody(node: TipTapNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  const inner = node.content?.map(renderBody).join("") ?? "";
  switch (node.type) {
    case "paragraph": return `<p>${inner}</p>`;
    case "heading": return `<h3>${inner}</h3>`;
    case "bulletList": return `<ul>${inner}</ul>`;
    case "listItem": return `<li>${inner}</li>`;
    case "strong": return `<strong>${inner}</strong>`;
    default: return inner;
  }
}

async function reserveListingAction(formData: FormData) {
  "use server";
  await reserveListing(formData);
}

export default async function HousingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await prisma.housingListing.findUnique({ where: { slug } });
  if (!listing || listing.status !== "PUBLISHED") notFound();

  const plans = (listing.paymentPlans as Array<{ months: number; deposit?: number; monthly?: number; label?: string }>) ?? [];
  const descHtml = renderBody(listing.description as TipTapNode);

  return (
    <div className="container-x py-12">
      <div className="mb-6 text-sm text-slate-500"><Link href="/housing">← Back to housing</Link></div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <ListingGallery imageKeys={listing.galleryKeys} title={listing.title} />
          <div>
            <Badge>{listing.type}</Badge>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">{listing.title}</h1>
            <p className="mt-2 text-slate-500">{listing.location}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              {listing.bedrooms ? <span><strong>{listing.bedrooms}</strong> bed</span> : null}
              {listing.bathrooms ? <span><strong>{listing.bathrooms}</strong> bath</span> : null}
              <span><strong>{formatNGN(toNumber(listing.price))}</strong></span>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <div className="prose-content text-slate-700" dangerouslySetInnerHTML={{ __html: descHtml || "<p>Description coming soon.</p>" }} />
            </CardContent>
          </Card>

          {listing.features.length > 0 ? (
            <Card>
              <CardHeader><CardTitle>Features & amenities</CardTitle></CardHeader>
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
          ) : null}

          {listing.floorPlanKeys.length > 0 ? (
            <Card>
              <CardHeader><CardTitle>Floor plans</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.floorPlanKeys.map((k) => (
                    <div key={k} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image src={publicUrl(k)} alt="Floor plan" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

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

          {listing.videoUrl ? (
            <Card>
              <CardHeader><CardTitle>Video walkthrough</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe src={toEmbedUrl(listing.videoUrl)} className="h-full w-full rounded-b-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Walkthrough" />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Reserve this property</CardTitle></CardHeader>
            <CardContent>
              <form action={reserveListingAction} className="space-y-3">
                <input type="hidden" name="listingType" value="HOUSING" />
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="paymentMode" value="OUTRIGHT" />
                <Button type="submit" className="w-full">Reserve for {formatNGN(toNumber(listing.price))}</Button>
                <p className="text-xs text-slate-500">You must be logged in as a customer. You can still book an inspection below without reserving.</p>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Book inspection</CardTitle></CardHeader>
            <CardContent>
              <InspectionForm listingType="HOUSING" listingId={listing.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
