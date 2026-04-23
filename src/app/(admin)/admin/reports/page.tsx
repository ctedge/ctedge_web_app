import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatNGN, toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, subMonths } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const since = startOfMonth(subMonths(new Date(), 5));

  const [payments, investments, purchases, leads] = await Promise.all([
    prisma.payment.findMany({ where: { paidAt: { gte: since } }, select: { amount: true, paidAt: true } }),
    prisma.investment.findMany({ where: { investedAt: { gte: since } }, select: { amount: true, investedAt: true, status: true } }),
    prisma.purchase.findMany({ where: { startedAt: { gte: since } }, select: { totalPrice: true, startedAt: true, listingType: true } }),
    prisma.lead.count(),
  ]);

  const monthly: Record<string, { month: string; payments: number; investments: number; sales: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = startOfMonth(subMonths(new Date(), 5 - i));
    const key = format(d, "yyyy-MM");
    monthly[key] = { month: format(d, "MMM yyyy"), payments: 0, investments: 0, sales: 0 };
  }
  for (const p of payments) {
    const key = format(p.paidAt, "yyyy-MM");
    if (monthly[key]) monthly[key].payments += toNumber(p.amount);
  }
  for (const i of investments) {
    if (i.status === "APPROVED" || i.status === "MATURED") {
      const key = format(i.investedAt, "yyyy-MM");
      if (monthly[key]) monthly[key].investments += toNumber(i.amount);
    }
  }
  for (const p of purchases) {
    const key = format(p.startedAt, "yyyy-MM");
    if (monthly[key]) monthly[key].sales += toNumber(p.totalPrice);
  }
  const rows = Object.values(monthly);

  const totalPayments = rows.reduce((s, r) => s + r.payments, 0);
  const totalInvestments = rows.reduce((s, r) => s + r.investments, 0);
  const totalSales = rows.reduce((s, r) => s + r.sales, 0);

  return (
    <>
      <PageHeader title="Reports" description="Last 6 months across sales, payments and investments.">
        <Link href="/api/admin/reports/export?type=payments"><Button variant="outline" size="sm">Export payments CSV</Button></Link>
        <Link href="/api/admin/reports/export?type=investments"><Button variant="outline" size="sm">Export investments CSV</Button></Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Payments</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-emerald-700">{formatNGN(totalPayments)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Investments</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-teal-700">{formatNGN(totalInvestments)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Sales value</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{formatNGN(totalSales)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Leads (total)</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{leads}</CardContent></Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Monthly breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead><TR><TH>Month</TH><TH>Sales</TH><TH>Payments</TH><TH>Investments</TH></TR></THead>
            <TBody>
              {rows.map((r) => (
                <TR key={r.month}>
                  <TD className="font-medium">{r.month}</TD>
                  <TD>{formatNGN(r.sales)}</TD>
                  <TD>{formatNGN(r.payments)}</TD>
                  <TD>{formatNGN(r.investments)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Purchase mix</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Badge variant="secondary">Land · {purchases.filter((p) => p.listingType === "LAND").length}</Badge>
          <Badge variant="secondary">Housing · {purchases.filter((p) => p.listingType === "HOUSING").length}</Badge>
        </CardContent>
      </Card>
    </>
  );
}
