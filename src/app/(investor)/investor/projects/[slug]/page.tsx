import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { InvestForm } from "./invest-form";

export const dynamic = "force-dynamic";

export default async function InvestmentProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireRole(["INVESTOR", "ADMIN"]);
  const project = await prisma.investmentProject.findUnique({ where: { slug } });
  if (!project) notFound();

  const raised = toNumber(project.totalRaised);
  const target = toNumber(project.totalTarget);
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  return (
    <>
      <PageHeader title={project.title} description={`${project.roiPercent}% over ${project.durationMonths} months · matures ${project.maturityDate.toDateString()}`}>
        <Badge variant={project.status === "OPEN" ? "success" : "secondary"}>{project.status}</Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>About this opportunity</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-line text-sm leading-6 text-slate-700">{project.description}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Funding progress</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-xs text-slate-500"><span>Raised</span><span>{pct}%</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-700" style={{ width: `${pct}%` }} /></div>
              <div className="mt-2 flex justify-between text-sm text-slate-600"><span>{formatNGN(raised)}</span><span>Target {formatNGN(target)}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>At a glance</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Min investment</span><span className="font-semibold">{formatNGN(toNumber(project.minAmount))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ROI</span><span className="font-semibold">{project.roiPercent}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold">{project.durationMonths} months</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Maturity</span><span className="font-semibold">{project.maturityDate.toDateString()}</span></div>
            </CardContent>
          </Card>

          {project.status === "OPEN" ? (
            <Card>
              <CardHeader><CardTitle>Invest now</CardTitle></CardHeader>
              <CardContent>
                <InvestForm projectId={project.id} minAmount={toNumber(project.minAmount)} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
