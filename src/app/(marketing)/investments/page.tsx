import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Clock, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNGN, toNumber } from "@/lib/money";
import { Empty } from "@/components/ui/empty";

export const metadata: Metadata = { title: "Investment Opportunities" };
export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const [projects, user] = await Promise.all([
    prisma.investmentProject.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
    }),
    currentUser(),
  ]);

  return (
    <div>
      <section className="relative bg-gradient-to-r from-emerald-700 to-teal-900 text-white bg-no-repeat bg-cover" style={{ backgroundImage: "url('invest.png')"}}>
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container-x py-20 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Invest</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">Asset-backed real estate investments.</h1>
          <p className="mt-4 max-w-2xl text-teal-100">Earn fixed returns tied directly to real, verifiable property assets.</p>
          {!user ? (
            <div className="mt-6">
              <Link href="/register?role=investor"><Button size="lg" className="bg-white text-teal-900 hover:bg-teal-50">Become an investor</Button></Link>
            </div>
          ) : null}
        </div>
      </section>
      <section className="container-x py-20">
        <h2 className="text-2xl font-bold text-slate-900">Open opportunities</h2>
        {projects.length === 0 ? (
          <div className="mt-8"><Empty title="No open opportunities right now" description="Check back soon — new projects are published regularly." /></div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {projects.map((p) => {
              const target = toNumber(p.totalTarget);
              const raised = toNumber(p.totalRaised);
              const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="success">{p.status}</Badge>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{p.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-2xl font-bold text-teal-700"><TrendingUp className="h-5 w-5" />{p.roiPercent}%</div>
                      <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />ROI / {p.durationMonths}mo</div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-600">{p.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{formatNGN(raised)} raised</span>
                      <span>{pct}% of {formatNGN(target)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-teal-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500"><Wallet className="h-4 w-4 text-teal-700" />Min. from <span className="font-semibold text-slate-900">{formatNGN(toNumber(p.minAmount))}</span></div>
                    <Link href={`/investments/${p.slug}`}><Button>Invest</Button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
