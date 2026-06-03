import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { formatNGN, toNumber } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireRole("ADMIN");
  const { q, page: rawPage } = await searchParams;

  const where = {
    role: "CUSTOMER" as const,
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] } : {}),
  };

  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);

  const customers = await prisma.user.findMany({
    where,
    include: {
      purchases: { include: { invoices: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <PageHeader title="Customers" description="All registered property buyers." />

      <form className="mb-4">
        <Input name="q" placeholder="Search by name, email, or phone…" defaultValue={q ?? ""} />
      </form>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="p-6"><Empty title="No customers found" description="Adjust your search or wait for signups." /></div>
          ) : (
            <Table>
              <THead><TR><TH>Customer</TH><TH>Phone</TH><TH>Purchases</TH><TH>Paid to date</TH><TH className="text-right">Detail</TH></TR></THead>
              <TBody>
                {customers.map((c) => {
                  const paid = c.purchases.reduce((s, p) => s + p.invoices.filter((i) => i.status === "PAID").reduce((x, i) => x + toNumber(i.amount), 0), 0);
                  return (
                    <TR key={c.id}>
                      <TD>
                        <div className="font-medium">{c.name ?? "—"}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </TD>
                      <TD>{c.phone ?? "—"}</TD>
                      <TD>{c.purchases.length}</TD>
                      <TD>{formatNGN(paid)}</TD>
                      <TD className="text-right"><Link href={`/admin/customers/${c.id}`} className="text-sm font-semibold text-teal-700 hover:underline">Open</Link></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            prevHref={buildPageHref("/admin/customers", { q, page: page - 1 })}
            nextHref={buildPageHref("/admin/customers", { q, page: page + 1 })}
          />
        </CardContent>
      </Card>
    </>
  );
}
