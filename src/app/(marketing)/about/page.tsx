import type { Metadata } from "next";
import { ShieldCheck, Hammer, TrendingUp, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = { title: "About" };

const values: { title: string; body: string; Icon: LucideIcon }[] = [
  { title: "Integrity first", body: "Clean titles, full documentation, and transparent pricing on every transaction.", Icon: ShieldCheck },
  { title: "Built to last", body: "Our estates and homes are engineered for decades of value and safety.", Icon: Hammer },
  { title: "Growth together", body: "When our investors and customers win, we win. That&apos;s the whole point.", Icon: TrendingUp },
];

const milestones = [
  { year: "2015", title: "Founded", body: "Started with a single estate project and five customers." },
  { year: "2019", title: "Housing arm launched", body: "Expanded into residential builds across Lagos." },
  { year: "2022", title: "Investor programme", body: "Opened asset-backed investment vehicles to the public." },
  { year: "2025", title: "Digital-first", body: "Fully digital dashboards for customers and investors." },
];

export default function AboutPage() {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";
  return (
    <>
      <PageHero
        eyebrow={`About ${company}`}
        title="A decade of building real estate wealth — the honest way."
        description="We design, build, sell, and manage real estate assets for buyers and investors across Nigeria. Our mission is simple: turn every acre into long-term, verifiable value."
      />
      <div className="container-x py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <v.Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{v.title}</h3>
            <p className="mt-2 text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: v.body }} />
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold text-slate-900">Our journey</h2>
        <ol className="mt-8 space-y-6 border-l-2 border-teal-700/20 pl-6">
          {milestones.map((m) => (
            <li key={m.year}>
              <div className="text-sm font-semibold text-teal-700">{m.year}</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{m.title}</div>
              <p className="mt-1 text-slate-600">{m.body}</p>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </>
  );
}
