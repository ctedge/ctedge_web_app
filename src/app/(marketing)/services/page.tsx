import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Construction Services" };

const services = [
  { title: "Residential builds", body: "Bungalows, duplexes, terraces, and custom homes delivered turnkey." },
  { title: "Commercial developments", body: "Offices, retail spaces, and mixed-use buildings with full project management." },
  { title: "Estate infrastructure", body: "Road networks, drainage, perimeter fencing, and gatehouses for new estates." },
  { title: "Renovations", body: "Full renovations and structural upgrades to existing properties." },
  { title: "Project management", body: "Act as the builder-in-charge for your land, from design to handover." },
  { title: "BOQ & architectural design", body: "In-house architects and quantity surveyors." },
];

const steps = [
  { n: "01", title: "Consult", body: "We meet, understand your goals, site, and budget." },
  { n: "02", title: "Design", body: "Architectural drawings, BOQ, and project timeline." },
  { n: "03", title: "Build", body: "Phased construction with weekly progress updates." },
  { n: "04", title: "Handover", body: "Snag-free handover with full documentation." },
];

export default function ServicesPage() {
  return (
    <div>
      <section className="relative bg-slate-900 text-white bg-no-repeat bg-cover" style={{ backgroundImage: "url('services_hero.png')"}}>
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container-x py-20 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Construction</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">We build what we&apos;ve drawn — to the last brick.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            From one-off homes to full estate infrastructure, we deliver construction projects on time and on budget.
          </p>
          <Link href="/contact"><Button size="lg" className="mt-8 bg-teal-500 hover:bg-teal-600">Start a project</Button></Link>
        </div>
      </section>
      <section className="container-x py-20">
        <h2 className="text-3xl font-bold text-slate-900">What we offer</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-teal-50">
        <div className="container-x py-20">
          <h2 className="text-3xl font-bold text-slate-900">Our process</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="text-sm font-bold text-teal-700">{s.n}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{s.title}</div>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
