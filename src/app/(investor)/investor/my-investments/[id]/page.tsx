import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatNGN, toNumber } from "@/lib/money";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole(["INVESTOR", "ADMIN"]);
  const investment = await prisma.investment.findUnique({
    where: { id },
    include: { project: true, disbursements: { orderBy: { paidAt: "desc" } }, invoices: { include: { payment: true }, orderBy: { issuedAt: "desc" } } },
  });
  if (!investment || (investment.investorId !== user.id && user.role !== "ADMIN")) notFound();

  const disbursed = investment.disbursements.reduce((s, d) => s + toNumber(d.amount), 0);
  const principal = toNumber(investment.amount);
  const expected = principal * (1 + investment.project.roiPercent / 100);
  const remaining = Math.max(0, expected - disbursed);
  const msToMaturity = investment.project.maturityDate.getTime() - Date.now();
  const daysToMaturity = Math.max(0, Math.ceil(msToMaturity / (1000 * 60 * 60 * 24)));

  return (
    <>
      <PageHeader title={investment.project.title} description={`Invested ${format(investment.investedAt, "MMM d, yyyy")}`}>
        <Badge variant={investment.status === "APPROVED" ? "success" : investment.status === "PENDING" ? "warning" : investment.status === "REJECTED" ? "danger" : "secondary"}>{investment.status}</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Principal</CardTitle></CardHeader><CardContent className="pt-0 text-xl font-bold">{formatNGN(principal)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Expected</CardTitle></CardHeader><CardContent className="pt-0 text-xl font-bold text-teal-700">{formatNGN(expected)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid out</CardTitle></CardHeader><CardContent className="pt-0 text-xl font-bold text-emerald-700">{formatNGN(disbursed)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Days to maturity</CardTitle></CardHeader><CardContent className="pt-0 text-xl font-bold">{daysToMaturity}</CardContent></Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Disbursements</CardTitle></CardHeader>
        <CardContent>
          {investment.disbursements.length === 0 ? (
            <p className="text-sm text-slate-500">No payouts recorded yet. Remaining: {formatNGN(remaining)}</p>
          ) : (
            <Table>
              <THead><TR><TH>Date</TH><TH>Amount</TH><TH>Note</TH></TR></THead>
              <TBody>
                {investment.disbursements.map((d) => (
                  <TR key={d.id}>
                    <TD>{format(d.paidAt, "MMM d, yyyy")}</TD>
                    <TD className="font-semibold">{formatNGN(toNumber(d.amount))}</TD>
                    <TD className="text-slate-600">{d.note ?? "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {investment.agreementKey ? (
        <Card className="mt-8">
          <CardHeader><CardTitle>Agreement</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Investment agreement is available for download.</p>
            <Link href={`/api/documents/by-key?key=${encodeURIComponent(investment.agreementKey)}`} target="_blank"><Button variant="outline">Download</Button></Link>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
