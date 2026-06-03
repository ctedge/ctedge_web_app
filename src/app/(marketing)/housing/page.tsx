import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/marketing/property-card";
import { formatNGN, toNumber } from "@/lib/money";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import type { HousingType } from "@prisma/client";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = { title: "Housing for sale" };
export const dynamic = "force-dynamic";

const housingTypes: HousingType[] = ["BUNGALOW", "DUPLEX", "TERRACE", "APARTMENT", "MAISONETTE", "PENTHOUSE", "OTHER"];

type SP = { type?: string; bedrooms?: string; maxPrice?: string };

export default async function HousingIndexPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const type = housingTypes.includes(sp.type as HousingType) ? (sp.type as HousingType) : undefined;
  const bedrooms = sp.bedrooms ? Number(sp.bedrooms) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const listings = await prisma.housingListing.findMany({
    where: {
      status: "PUBLISHED",
      ...(type ? { type } : {}),
      ...(bedrooms ? { bedrooms: { gte: bedrooms } } : {}),
      ...(maxPrice ? { price: { lte: maxPrice } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHero eyebrow="Properties" title="Housing for sale" description="Move-in ready and off-plan homes with flexible payment plans." />
      <div className="container-x py-12">
      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <Select name="type" defaultValue={sp.type ?? ""}>
          <option value="">Any type</option>
          {housingTypes.map((t) => <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>)}
        </Select>
        <Select name="bedrooms" defaultValue={sp.bedrooms ?? ""}>
          <option value="">Any bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </Select>
        <Input name="maxPrice" type="number" placeholder="Max price (₦)" defaultValue={sp.maxPrice ?? ""} />
        <Button type="submit">Filter</Button>
      </form>

      {listings.length === 0 ? (
        <div className="mt-10"><Empty title="No matching listings" description="Try adjusting your filters." /></div>
      ) : (

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((h) => (
            <PropertyCard
              key={h.id}
              href={`/housing/${h.slug}`}
              title={h.title}
              subtitle={`${h.type.toLowerCase()} · ${h.location}`}
              price={formatNGN(toNumber(h.price))}
              imageKey={h.galleryKeys[0]}
              tag={h.bedrooms ? `${h.bedrooms} bed` : undefined}
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
