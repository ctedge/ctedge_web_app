import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { formatNGN, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);

  const purchases = await prisma.purchase.findMany({
    where: { customerId: user.id },
    include: {
      installments: true,
      invoices: { include: { payment: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  const totalDue = purchases.reduce((sum, p) => {
    const totalPaid = p.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + toNumber(i.amount), 0);
    return sum + (toNumber(p.totalPrice) - totalPaid);
  }, 0);

  const openInvoices = purchases.flatMap((p) => p.invoices.filter((i) => i.status === "UNPAID" || i.status === "AWAITING_REVIEW"));

  return (
    <>
      <PageHeader title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} description="Your purchases, payments, and documents at a glance." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Properties</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{purchases.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Outstanding balance</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{formatNGN(totalDue)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Open invoices</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{openInvoices.length}</CardContent></Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Properties</CardTitle></CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-slate-500">You haven&apos;t reserved any properties yet. <Link href="/land" className="font-semibold text-teal-700 hover:underline">Browse land</Link>.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/dashboard/properties/${p.id}`} className="font-semibold text-slate-900 hover:underline">
                      {p.listingType === "LAND" ? "Land" : "Housing"} — {formatNGN(toNumber(p.totalPrice))}
                    </Link>
                    <div className="text-xs text-slate-500">{p.paymentMode === "INSTALLMENT" ? "Installment plan" : "Outright"}</div>
                  </div>
                  <Badge variant={p.paymentMode === "INSTALLMENT" ? "warning" : "success"}>{p.paymentMode}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
