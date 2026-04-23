import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { formatNGN, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function MyInvestmentsPage() {
  const user = await requireRole(["INVESTOR", "ADMIN"]);
  const investments = await prisma.investment.findMany({
    where: { investorId: user.id },
    include: { project: true, disbursements: true },
    orderBy: { investedAt: "desc" },
  });

  return (
    <>
      <PageHeader title="My investments" description="Track status, returns, and payouts on your active investments." />
      {investments.length === 0 ? (
        <Empty title="No investments yet" description="Browse our open investment projects to get started." action={<Link href="/investor/projects" className="font-semibold text-teal-700 hover:underline">See projects</Link>} />
      ) : (
        <div className="grid gap-4">
          {investments.map((i) => {
            const disbursed = i.disbursements.reduce((s, d) => s + toNumber(d.amount), 0);
            const expected = toNumber(i.amount) * (1 + i.project.roiPercent / 100);
            return (
              <Link key={i.id} href={`/investor/my-investments/${i.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={i.status === "APPROVED" ? "success" : i.status === "PENDING" ? "warning" : i.status === "REJECTED" ? "danger" : "secondary"}>{i.status}</Badge>
                        <span className="text-xs text-slate-500">{i.project.roiPercent}% ROI · {i.project.durationMonths}m</span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{i.project.title}</h3>
                      <p className="text-xs text-slate-500">Invested {i.investedAt.toDateString()} · matures {i.project.maturityDate.toDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Principal</div>
                      <div className="text-2xl font-bold text-teal-700">{formatNGN(toNumber(i.amount))}</div>
                      <div className="text-xs text-slate-500">Expected {formatNGN(expected)} · paid out {formatNGN(disbursed)}</div>
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
