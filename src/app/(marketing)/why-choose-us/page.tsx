import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description:
    "Verified titles, flexible payment plans, asset-backed investments and professional project delivery — see why customers and investors trust us.",
};

const reasons: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "Verified titles & clean documentation",
    body: "Every plot and property we sell comes with registered, due-diligence-ready documentation. No disputes, no surprises.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Flexible, transparent payment plans",
    body: "Outright or structured installment plans — 3, 6, 12 months and beyond. You see every line item before you sign.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5v9a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18V9Zm4 7.5h3" />
      </svg>
    ),
  },
  {
    title: "Asset-backed investments",
    body: "Every naira you invest is tied to real, identifiable property. Returns are fixed-tenor and tracked on your dashboard.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l5-5 4 4 8-9M14 7h7v7" />
      </svg>
    ),
  },
  {
    title: "Professional project delivery",
    body: "In-house construction, supervision, and handover — no middlemen, no delays we can&apos;t explain. We build what we promise.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9l7-4 7 4v12M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    title: "End-to-end digital experience",
    body: "Track payments, download receipts, upload proofs, and see project progress — all from your personal dashboard.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v10.5H3.75zM8.25 21h7.5M12 17.25V21" />
      </svg>
    ),
  },
  {
    title: "Responsive, human support",
    body: "Call, email, or WhatsApp — a real person responds. We&apos;re here before, during, and long after the transaction.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm6.75-2.25a3 3 0 1 1 4.682 2.488c-.676.449-1.182 1.096-1.182 1.85V15" />
        <circle cx="12" cy="17.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
];

const stats = [
  { stat: "500+", label: "Families housed" },
  { stat: "12+", label: "Estates delivered" },
  { stat: "18%", label: "Avg. annual ROI" },
  { stat: "10+", label: "Years in market" },
];

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "Tell us your goals — buy, build, or invest. We match you with the right offering.",
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
    body: "Track allocations, payments, and returns from your dashboard — with updates at every milestone.",
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
      <section className="bg-white">
        <div className="container-x py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Why choose {company}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-slate-900 md:text-5xl">
            The real estate partner you can actually trust.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Thousands of Nigerians are building wealth, owning homes, and investing with confidence through us.
            Here&apos;s what sets us apart.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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
                    {r.icon}
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
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold md:text-4xl">{s.stat}</div>
                <div className="mt-1 text-sm text-teal-100">{s.label}</div>
              </div>
            ))}
          </div>
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
            Talk to our team — we&apos;ll guide you to the right plot, home, or investment.
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
