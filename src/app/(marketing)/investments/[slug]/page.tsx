import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/rbac";
import { getCompanySettings } from "@/lib/company-settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNGN, toNumber } from "@/lib/money";
import { InvestForm } from "@/app/(investor)/investor/projects/[slug]/invest-form";

export const dynamic = "force-dynamic";

export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, user] = await Promise.all([
    prisma.investmentProject.findUnique({ where: { slug } }),
    currentUser(),
  ]);
  if (!project) notFound();

  const raised = toNumber(project.totalRaised);
  const target = toNumber(project.totalTarget);
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const canInvest = user?.role === "INVESTOR" || user?.role === "ADMIN";

  const settings = await getCompanySettings();
  const email = settings.email;
  const phoneDigits = settings.phone.replace(/[^\d+]/g, "");
  const whatsappDigits = settings.whatsapp.replace(/\D/g, "");
  const subject = `Question about ${project.title}`;
  const msg = `Hi, I'd like to learn more about the "${project.title}" investment opportunity.`;

  return (
    <div className="container-x py-12">
      <div className="mb-6 text-sm text-slate-500"><Link href="/investments">← Back to opportunities</Link></div>

      <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <Badge variant={project.status === "OPEN" ? "success" : "secondary"}>{project.status}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">{project.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {project.roiPercent}% over {project.durationMonths} months · matures {project.maturityDate.toDateString()}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold text-teal-700">{project.roiPercent}%</div>
          <div className="text-xs text-slate-500">ROI / {project.durationMonths}mo</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
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
                {canInvest ? (
                  <InvestForm projectId={project.id} minAmount={toNumber(project.minAmount)} />
                ) : !user ? (
                  <div className="space-y-3 text-sm">
                    <p className="text-slate-600">You need an investor account to invest in this opportunity.</p>
                    <Link href={`/register?role=investor&returnTo=/investments/${project.slug}`} className="block"><Button className="w-full">Open investor account</Button></Link>
                    <Link href={`/login?returnTo=/investments/${project.slug}`} className="block"><Button variant="outline" className="w-full">Sign in</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p className="text-slate-600">Your current account isn&apos;t set up to invest. Open an investor account to participate in this opportunity.</p>
                    <Link href={`/register?role=investor&returnTo=/investments/${project.slug}`} className="block"><Button className="w-full">Open investor account</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>Learn more</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Have questions about this opportunity? Talk to our team.</p>
              <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`} className="block">
                <Button variant="outline" className="w-full">Email us</Button>
              </a>
              {phoneDigits ? (
                <a href={`tel:${phoneDigits}`} className="block">
                  <Button variant="outline" className="w-full">Call us</Button>
                </a>
              ) : null}
              {whatsappDigits ? (
                <a href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">Chat on WhatsApp</Button>
                </a>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
