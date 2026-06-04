import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, CreditCard, TrendingUp, HardHat, LayoutDashboard, MessageCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { MetricsStrip } from "@/components/marketing/metrics-strip";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description:
    "Verified titles, flexible payment plans, asset-backed investments and professional project delivery. See why customers and investors trust us.",
};

const reasons: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "Verified titles & clean documentation",
    body: "Every plot and property we sell comes with registered, due-diligence-ready documentation. No disputes, no surprises.",
    Icon: ShieldCheck,
  },
  {
    title: "Flexible, transparent payment plans",
    body: "Outright or structured installment plans across 3, 6, 12 months and beyond. You see every line item before you sign.",
    Icon: CreditCard,
  },
  {
    title: "Asset-backed investments",
    body: "Every naira you invest is tied to real, identifiable property. Returns are fixed-tenor and tracked on your dashboard.",
    Icon: TrendingUp,
  },
  {
    title: "Professional project delivery",
    body: "In-house construction, supervision, and handover. No middlemen, no delays we can&apos;t explain. We build what we promise.",
    Icon: HardHat,
  },
  {
    title: "End-to-end digital experience",
    body: "Track payments, download receipts, upload proofs, and see project progress, all from your personal dashboard.",
    Icon: LayoutDashboard,
  },
  {
    title: "Responsive, human support",
    body: "Call, email, or WhatsApp and a real person responds. We&apos;re here before, during, and long after the transaction.",
    Icon: MessageCircle,
  },
];

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "Tell us your goals: buy, build, or invest. We match you with the right offering.",
  },
  {
    n: "02",
    title: "Inspect & verify",
    body: "Visit the site, review the documentation, and ask every question. No pressure.",
  },
  {
    n: "03",
    title: "Purchase or invest",
    body: "Pay outright or on a plan that fits. Every transaction is digitally receipted.",
  },
  {
    n: "04",
    title: "Own & grow",
    body: "Track allocations, payments, and returns from your dashboard, with updates at every milestone.",
  },
];

const testimonials = [
  {
    quote:
      "The documentation was ready before I even asked. That&apos;s how I knew this was different from anywhere else I&apos;d shopped.",
    name: "Adaeze N.",
    role: "Landowner, Ibeju-Lekki",
  },
  {
    quote:
      "Returns came exactly when they said they would. The dashboard made it easy to see where my money was working.",
    name: "Tunde O.",
    role: "Investor",
  },
  {
    quote:
      "They finished our duplex ahead of schedule and kept us posted every single week. Rare in this industry.",
    name: "Mr. & Mrs. Bello",
    role: "Homeowners",
  },
];

export default function WhyChooseUsPage() {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";

  return (
    <>
      <PageHero
        eyebrow={`Why choose ${company}`}
        title="The real estate partner you can actually trust."
        description="Thousands of Nigerians are building wealth, owning homes, and investing with confidence through us. Here's what sets us apart."
      />
      <section className="bg-white">
        <div className="container-x py-10">
          <div className="flex flex-wrap gap-3">
            <Link href="/contact"><Button size="lg">Talk to us</Button></Link>
            <Link href="/projects"><Button size="lg" variant="outline">See our work</Button></Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="container-x py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r) => (
              <Card key={r.title} className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <r.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{r.title}</h3>
                  <p className="mt-2 text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: r.body }} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#011F54] text-white">
        <div className="container-x py-16">
          <MetricsStrip variant="dark" />
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">How we work</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">A clear, simple process</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 p-6">
                <div className="text-sm font-semibold text-teal-700">{s.n}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{s.title}</div>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="container-x py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">What our clients say</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Trusted by buyers and investors</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-teal-200">
                    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17v6.66h6.66V11.6H5.33a1.84 1.84 0 0 1 1.84-1.84V6Zm10 0A5.17 5.17 0 0 0 12 11.17v6.66h6.66V11.6h-3.33a1.84 1.84 0 0 1 1.84-1.84V6Z" />
                  </svg>
                  <p
                    className="mt-4 flex-1 text-sm text-slate-700"
                    dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }}
                  />
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="container-x py-20 text-center">
          <h3 className="text-3xl font-bold">Ready to get started?</h3>
          <p className="mt-3 text-slate-300">
            Talk to our team. We&apos;ll guide you to the right plot, home, or investment.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contact"><Button size="lg" className="bg-teal-500 hover:bg-teal-600">Get in touch</Button></Link>
            <Link href="/investments"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">See investments</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
