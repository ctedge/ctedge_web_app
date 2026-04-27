import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { Empty } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function MyPropertiesPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  const purchases = await prisma.purchase.findMany({
    where: { customerId: user.id },
    include: { invoices: true, installments: true },
    orderBy: { startedAt: "desc" },
  });

  const listingTitles = await Promise.all(
    purchases.map(async (p) => {
      const title = p.listingType === "LAND"
        ? (await prisma.landListing.findUnique({ where: { id: p.listingId }, select: { title: true, slug: true } }))
        : (await prisma.housingListing.findUnique({ where: { id: p.listingId }, select: { title: true, slug: true } }));
      return { id: p.id, title: title?.title ?? "Listing", slug: title?.slug };
    })
  );
  const titleMap = Object.fromEntries(listingTitles.map((t) => [t.id, t]));

  return (
    <>
      <PageHeader title="My properties" description="Everything you've reserved or purchased." />
      {purchases.length === 0 ? (
        <Empty title="No properties yet" description="Browse land and housing to get started." />
      ) : (
        <div className="grid gap-4">
          {purchases.map((p) => {
            const paid = p.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + toNumber(i.amount), 0);
            const total = toNumber(p.totalPrice);
            const balance = Math.max(0, total - paid);
            const info = titleMap[p.id];
            return (
              <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge>{p.listingType}</Badge>
                        <Badge variant="secondary">{p.paymentMode}</Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{info.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Balance</div>
                      <div className="text-2xl font-bold text-teal-700">{formatNGN(balance)}</div>
                      <div className="text-xs text-slate-500">of {formatNGN(total)}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
