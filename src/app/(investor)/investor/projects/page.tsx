import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { Empty } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function InvestmentProjectsPage() {
  await requireRole(["INVESTOR", "ADMIN"]);
  const projects = await prisma.investmentProject.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Investment opportunities" description="Live projects currently accepting capital." />
      {projects.length === 0 ? (
        <Empty title="No open opportunities" description="Check back soon for new investment windows." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const raised = toNumber(p.totalRaised);
            const target = toNumber(p.totalTarget);
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            return (
              <Link key={p.id} href={`/investor/projects/${p.slug}`}>
                <Card className="h-full transition hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                      <Badge variant="success">{p.roiPercent}% ROI</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
                      <div><div className="font-semibold text-slate-900">{p.durationMonths}m</div>Duration</div>
                      <div><div className="font-semibold text-slate-900">{formatNGN(toNumber(p.minAmount))}</div>Min.</div>
                      <div><div className="font-semibold text-slate-900">{p.maturityDate.toDateString()}</div>Maturity</div>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Raised</span><span>{pct}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-700" style={{ width: `${pct}%` }} /></div>
                      <div className="mt-1 text-xs text-slate-500">{formatNGN(raised)} of {formatNGN(target)}</div>
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
