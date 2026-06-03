import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { deleteListing } from "@/server/actions/listings";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

async function deleteListingAction(formData: FormData) {
  "use server";
  await deleteListing(formData);
}

function buildHref(landPage: number, housingPage: number) {
  return buildPageHref("/admin/listings", { landPage, housingPage });
}

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ landPage?: string; housingPage?: string }> }) {
  await requireRole("ADMIN");
  const { landPage: rawLand, housingPage: rawHousing } = await searchParams;

  const [landCount, housingCount] = await Promise.all([
    prisma.landListing.count(),
    prisma.housingListing.count(),
  ]);

  const landTotalPages = Math.max(1, Math.ceil(landCount / PAGE_SIZE));
  const housingTotalPages = Math.max(1, Math.ceil(housingCount / PAGE_SIZE));
  const landPage = Math.min(parsePage(rawLand), landTotalPages);
  const housingPage = Math.min(parsePage(rawHousing), housingTotalPages);

  const [land, housing] = await Promise.all([
    prisma.landListing.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (landPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.housingListing.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (housingPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return (
    <>
      <PageHeader title="Listings" description="Manage land and housing inventory.">
        <Link href="/admin/listings/land/new"><Button variant="outline">New land</Button></Link>
        <Link href="/admin/listings/housing/new"><Button>New housing</Button></Link>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Land ({landCount})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {land.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No land listings yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>Location</TH><TH>Plot</TH><TH>Price</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {land.map((l) => (
                  <TR key={l.id}>
                    <TD className="font-medium">{l.title}</TD>
                    <TD>{l.location}</TD>
                    <TD>{l.plotSizeSqm} sqm</TD>
                    <TD>{l.priceOutright ? formatNGN(toNumber(l.priceOutright)) : "—"}</TD>
                    <TD><Badge variant={l.status === "PUBLISHED" ? "success" : l.status === "DRAFT" ? "warning" : "secondary"}>{l.status}</Badge></TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/listings/land/${l.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                      <form action={deleteListingAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="kind" value="LAND" />
                        <Button variant="ghost" size="sm" type="submit">Delete</Button>
                      </form>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={landPage}
            totalPages={landTotalPages}
            prevHref={buildHref(landPage - 1, housingPage)}
            nextHref={buildHref(landPage + 1, housingPage)}
          />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Housing ({housingCount})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {housing.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No housing listings yet.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>Type</TH><TH>Location</TH><TH>Price</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {housing.map((h) => (
                  <TR key={h.id}>
                    <TD className="font-medium">{h.title}</TD>
                    <TD>{h.type}</TD>
                    <TD>{h.location}</TD>
                    <TD>{formatNGN(toNumber(h.price))}</TD>
                    <TD><Badge variant={h.status === "PUBLISHED" ? "success" : h.status === "DRAFT" ? "warning" : "secondary"}>{h.status}</Badge></TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/listings/housing/${h.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                      <form action={deleteListingAction}>
                        <input type="hidden" name="id" value={h.id} />
                        <input type="hidden" name="kind" value="HOUSING" />
                        <Button variant="ghost" size="sm" type="submit">Delete</Button>
                      </form>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={housingPage}
            totalPages={housingTotalPages}
            prevHref={buildHref(landPage, housingPage - 1)}
            nextHref={buildHref(landPage, housingPage + 1)}
          />
        </CardContent>
      </Card>
    </>
  );
}

