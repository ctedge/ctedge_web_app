import type { Metadata } from "next";
import { ShieldCheck, Award, Handshake, Users, TrendingUp, Eye, Target, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { MetricsStrip } from "@/components/marketing/metrics-strip";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

export const metadata: Metadata = { title: "About" };

const values: { title: string; body: string; Icon: LucideIcon }[] = [
  { title: "Integrity", body: "We act with honesty in every transaction, every title, every conversation.", Icon: ShieldCheck },
  { title: "Excellence", body: "We hold our designs, builds, and service to a standard we would stake our name on.", Icon: Award },
  { title: "Trust", body: "We earn confidence by doing what we said we would do, on time, in full.", Icon: Handshake },
  { title: "Partnership", body: "Our clients, communities, and investors grow alongside us, not behind us.", Icon: Users },
  { title: "Growth", body: "Every project is built to compound long-term value for the people it serves.", Icon: TrendingUp },
];

export default async function AboutPage() {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "CT Edge Ltd";
  return (
    <>
      <PageHero
        eyebrow={`About ${company}`}
        title="Building secure property and long-term wealth across Nigeria."
        description="CT Edge Ltd is a forward-thinking real estate, investment, construction, and facility management company headquartered in Ilorin, with operations across Kwara, Lagos, Ibadan, and Abuja."
      />
      <div className="container-x py-16">
        <section className="mx-auto max-w-3xl animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-900">About CT Edge Ltd</h2>
          <div className="prose prose-slate mt-6 max-w-none">
            <p>
              CT Edge Ltd is a forward-thinking real estate, investment, construction, and facility management company committed to delivering value through strategic property development and infrastructure services.
            </p>
            <p>
              Based in Ilorin, the company provides innovative real estate solutions that enable individuals, families, and investors to own secure and affordable property while building long-term wealth.
            </p>
            <p>
              Our operations extend beyond Kwara State into major growth corridors such as Lagos, Ibadan, and Abuja.
            </p>
            <p>
              CT Edge Ltd combines professional construction expertise, transparent property transactions, and flexible investment opportunities to meet the growing demand for quality real estate in Nigeria.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-slate-50 p-8 md:p-10">
          <MetricsStrip variant="muted" className="bg-transparent" />
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="animate-slide-up animate-delay-100 rounded-xl border border-slate-200 bg-white p-8">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Eye className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal-700">Our vision</p>
            <p className="mt-3 text-lg text-slate-800">
              To be the leading catalyst for economic growth and community development through innovative real estate.
            </p>
          </div>
          <div className="animate-slide-up animate-delay-200 rounded-xl border border-slate-200 bg-white p-8">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Target className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal-700">Our mission</p>
            <p className="mt-3 text-lg text-slate-800">
              To provide and sustain investment opportunities through strategic and visionary real estate development.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900">Core values</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            At the core of our values lies a commitment to integrity, fostering strong partnerships, and striving for excellence in every project. We are dedicated to driving growth while building trust with our clients and communities.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {values.map((v, idx) => (
              <div
                key={v.title}
                className="animate-slide-up rounded-xl border border-slate-200 bg-white p-6"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <v.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{v.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <TestimonialsSection background="muted" />
    </>
  );
}
