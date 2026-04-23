import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/marketing/property-card";
import { formatNGN, toNumber } from "@/lib/money";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

export const metadata: Metadata = { title: "Land for sale" };
export const dynamic = "force-dynamic";

type SP = { location?: string; minPrice?: string; maxPrice?: string; size?: string };

export default async function LandIndexPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const minSize = sp.size ? Number(sp.size) : undefined;

  const listings = await prisma.landListing.findMany({
    where: {
      status: "PUBLISHED",
      ...(sp.location ? { location: { contains: sp.location, mode: "insensitive" } } : {}),
      ...(minSize ? { plotSizeSqm: { gte: minSize } } : {}),
      ...(minPrice || maxPrice
        ? {
            priceOutright: {
              ...(minPrice ? { gte: minPrice } : {}),
              ...(maxPrice ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-x py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Properties</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">Land for sale</h1>
      <form className="mt-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <Input name="location" placeholder="Location" defaultValue={sp.location ?? ""} />
        <Input name="minPrice" type="number" placeholder="Min price (₦)" defaultValue={sp.minPrice ?? ""} />
        <Input name="maxPrice" type="number" placeholder="Max price (₦)" defaultValue={sp.maxPrice ?? ""} />
        <Select name="size" defaultValue={sp.size ?? ""}>
          <option value="">Any size</option>
          <option value="300">300+ sqm</option>
          <option value="500">500+ sqm</option>
          <option value="1000">1000+ sqm</option>
        </Select>
        <Button type="submit">Filter</Button>
      </form>

      {listings.length === 0 ? (
        <div className="mt-10"><Empty title="No matching listings" description="Try adjusting your filters." /></div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <PropertyCard
              key={l.id}
              href={`/land/${l.slug}`}
              title={l.title}
              subtitle={l.location}
              price={formatNGN(toNumber(l.priceOutright ?? l.priceInstallment ?? 0))}
              imageKey={l.galleryKeys[0]}
              tag={`${l.plotSizeSqm} sqm`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
