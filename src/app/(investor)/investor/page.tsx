import { type Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Investor Portal" };
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { ROIChart } from "./roi-chart";

export const dynamic = "force-dynamic";

export default async function InvestorOverviewPage() {
  const user = await requireRole(["INVESTOR", "ADMIN"]);

  const investments = await prisma.investment.findMany({
    where: { investorId: user.id },
    include: { project: true, disbursements: true },
    orderBy: { investedAt: "desc" },
  });

  const approved = investments.filter((i) => i.status === "APPROVED" || i.status === "MATURED");
  const totalInvested = approved.reduce((s, i) => s + toNumber(i.amount), 0);
  const expectedReturns = approved.reduce(
    (s, i) => s + toNumber(i.amount) * (1 + i.project.roiPercent / 100),
    0
  );
  const totalDisbursed = investments.reduce(
    (s, i) => s + i.disbursements.reduce((ds, d) => ds + toNumber(d.amount), 0),
    0
  );

  const chartData = approved.map((i) => {
    const months = i.project.durationMonths;
    const rate = i.project.roiPercent / 100;
    return Array.from({ length: months + 1 }, (_, m) => ({
      month: m,
      value: toNumber(i.amount) * (1 + (rate * m) / months),
    }));
  });
  const merged = chartData.length
    ? chartData[0].map((_, idx) => ({
        month: idx,
        value: chartData.reduce((s, arr) => s + (arr[idx]?.value ?? 0), 0),
      }))
    : [];

  return (
    <>
      <PageHeader title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} description="Your investments and expected returns." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total invested</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{formatNGN(totalInvested)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Expected returns</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-teal-700">{formatNGN(expectedReturns)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Received so far</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold text-emerald-700">{formatNGN(totalDisbursed)}</CardContent></Card>
      </div>

      {merged.length > 0 ? (
        <Card className="mt-8">
          <CardHeader><CardTitle>Projected growth</CardTitle></CardHeader>
          <CardContent><ROIChart data={merged} /></CardContent>
        </Card>
      ) : null}

      <Card className="mt-8">
        <CardHeader><CardTitle>Your investments</CardTitle></CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p className="text-sm text-slate-500">You haven&apos;t invested yet. <Link href="/investor/projects" className="font-semibold text-teal-700 hover:underline">Browse opportunities</Link>.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {investments.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={`/investor/my-investments/${i.id}`} className="font-semibold text-slate-900 hover:underline">{i.project.title}</Link>
                    <div className="text-xs text-slate-500">{formatNGN(toNumber(i.amount))} · {i.project.roiPercent}% · matures {i.project.maturityDate.toDateString()}</div>
                  </div>
                  <Badge variant={i.status === "APPROVED" ? "success" : i.status === "PENDING" ? "warning" : i.status === "REJECTED" ? "danger" : "secondary"}>{i.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
