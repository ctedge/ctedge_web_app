import Link from "next/link";
import { Home, HardHat, TrendingUp, ShieldCheck, Wallet, MonitorSmartphone, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/marketing/property-card";
import { formatNGN, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";

  const [featuredLand, featuredHousing, featuredInvestment] = await Promise.all([
    prisma.landListing.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
    prisma.housingListing.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
    prisma.investmentProject.findFirst({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  return (
    <>
      <section className="relative overflow-hidden text-white" style={{backgroundAttachment: "fixed", clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)", backgroundImage: "url('/hero-image.jpg')" }}>
       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-slate-900/30" />
        <div className="container-x py-24 md:py-32 z-10 relative">
          <p className="animate-fade-in text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
            Real estate &middot; Construction &middot; Investment
          </p>
          <h1 className="animate-slide-up mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl animate-delay-100">
            Build wealth on land you can trust.
          </h1>
          <p className="animate-slide-up mt-5 max-w-2xl text-lg text-teal-100 animate-delay-200">
            {company} delivers prime land, quality homes, and high-yield real estate investments —
            backed by transparent documentation and flexible payment plans.
          </p>
          <div className="animate-slide-up mt-8 flex flex-wrap gap-3 animate-delay-300">
            <Link href="/land"><Button size="lg" className="transition-smooth bg-white text-teal-900 hover:bg-teal-50 hover:scale-105">Explore land</Button></Link>
            <Link href="/investments"><Button size="lg" variant="outline" className="transition-smooth border-white/40 bg-transparent text-white hover:bg-white/10 hover:scale-105">Invest with us</Button></Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-8">
            {[
              { stat: "500+", label: "Happy owners" },
              { stat: "12+", label: "Estates & developments" },
              { stat: "18%", label: "Avg. annual ROI" },
            ].map((s, idx) => (
              <div 
                key={s.label}
                className="animate-fade-in"
                style={{ "--animation-delay": `${400 + idx * 100}ms` } as React.CSSProperties}
              >
                <div className="text-2xl font-bold text-white md:text-3xl">{s.stat}</div>
                <div className="text-sm text-teal-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-white">
        <div className="container-x py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">About {company}</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                A trusted partner in land, housing, and real estate investment.
              </h2>
              <p className="mt-5 text-slate-700">
                We help Nigerians buy verified land, own quality homes, and grow wealth through asset-backed
                investments. Every project we deliver is built on clear documentation, professional oversight,
                and flexible payment options tailored to our clients.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="animate-scale-in rounded-xl border border-slate-200 p-5 transition-smooth animate-delay-200">
                  <h3 className="text-sm font-semibold text-slate-900">Our mission</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    To make property ownership and real estate investment accessible, transparent, and rewarding.
                  </p>
                </div>
                <div className="animate-scale-in rounded-xl border border-slate-200 p-5 transition-smooth animate-delay-300">
                  <h3 className="text-sm font-semibold text-slate-900">Our vision</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    To be West Africa&apos;s most trusted name for land, housing, and property-backed investments.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about"><Button size="lg" className="transition-smooth hover:scale-105">Our story</Button></Link>
                <Link href="/projects"><Button size="lg" variant="outline" className="transition-smooth hover:scale-105">See our projects</Button></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-left">
              {[
                { stat: "10+", label: "Years of experience" },
                { stat: "500+", label: "Families housed" },
                { stat: "12+", label: "Estates developed" },
                { stat: "₦5B+", label: "Assets under management" },
              ].map((s, idx) => (
                <div 
                  key={s.label} 
                  className="animate-scale-in rounded-2xl bg-slate-50 p-6"
                  style={{ "--animation-delay": `${idx * 100}ms` } as React.CSSProperties}
                >
                  <div className="text-3xl font-bold text-[#011F54]">{s.stat}</div>
                  <div className="mt-1 text-sm text-slate-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-slate-50">
        <div className="container-x py-20">
          <SectionHeader eyebrow="What we do" title="Our services" href="/services" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((svc, idx) => (
              <Card 
                key={svc.title} 
                className="group h-full animate-slide-up transition-smooth hover:shadow-md hover:translate-y-[-4px]"
                style={{ "--animation-delay": `${idx * 150}ms` } as React.CSSProperties}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-smooth group-hover:scale-110">
                    <svc.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{svc.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{svc.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                    {svc.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={svc.href}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-smooth hover:gap-2 hover:underline"
                  >
                    Learn more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <SectionHeader eyebrow="Featured" title="Land for sale" href="/land" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredLand.length === 0 ? (
            <p className="col-span-full text-sm text-slate-500">No listings yet. Seed the database to populate.</p>
          ) : (
            featuredLand.map((l, idx) => (
              <div 
                key={l.id}
                className="animate-scale-in"
                style={{ "--animation-delay": `${idx * 150}ms` } as React.CSSProperties}
              >
                <PropertyCard
                  href={`/land/${l.slug}`}
                  title={l.title}
                  subtitle={l.location}
                  price={formatNGN(toNumber(l.priceOutright ?? l.priceInstallment ?? 0))}
                  imageKey={l.galleryKeys[0]}
                  tag={`${l.plotSizeSqm} sqm`}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x py-20">
          <SectionHeader eyebrow="Featured" title="Housing" href="/housing" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredHousing.length === 0 ? (
              <p className="col-span-full text-sm text-slate-500">No housing listings yet.</p>
            ) : (
              featuredHousing.map((h) => (
                <PropertyCard
                  key={h.id}
                  href={`/housing/${h.slug}`}
                  title={h.title}
                  subtitle={`${h.type.toLowerCase()} · ${h.location}`}
                  price={formatNGN(toNumber(h.price))}
                  imageKey={h.galleryKeys[0]}
                  tag={h.bedrooms ? `${h.bedrooms} bed` : undefined}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section id="why-us" className="pt-4bg-slate-50 relative" style={{ clipPath: "polygon(0 15%, 100% 0, 100% 100%, 0% 100%)", backgroundImage: "url('/hero-image.jpg')", backgroundAttachment: "fixed" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/90" />
        <div className="container-x py-20 z-10 relative">
          <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Why choose us</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Built on trust. Backed by real assets.
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                We&apos;ve helped hundreds of Nigerians own land, build homes, and grow wealth — without the usual
                headaches of the real estate industry.
              </p>
            </div>
            <Link href="/why-choose-us" className="transition-smooth text-sm font-semibold text-teal-700 hover:gap-2 hover:underline">
              See all reasons →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((w, idx) => (
              <div 
                key={w.title} 
                className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 transition-smooth hover:shadow-md hover:translate-y-[-4px]"
                style={{ "--animation-delay": `${idx * 100}ms` } as React.CSSProperties}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-smooth">
                  <w.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{w.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredInvestment ? (
        <section className="container-x py-20">
          <Card className="animate-scale-in overflow-hidden transition-smooth hover:shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="animate-slide-right bg-teal-900 p-10 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Open for investment</p>
                <h3 className="mt-3 text-3xl font-bold">{featuredInvestment.title}</h3>
                <p className="mt-4 text-teal-100">{featuredInvestment.description.slice(0, 200)}…</p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  <div className="animate-fade-in animate-delay-200"><div className="text-lg font-bold">{featuredInvestment.roiPercent}%</div><div className="text-teal-200">ROI</div></div>
                  <div className="animate-fade-in animate-delay-300"><div className="text-lg font-bold">{featuredInvestment.durationMonths}mo</div><div className="text-teal-200">Tenor</div></div>
                  <div className="animate-fade-in animate-delay-400"><div className="text-lg font-bold">{formatNGN(toNumber(featuredInvestment.minAmount))}</div><div className="text-teal-200">Minimum</div></div>
                </div>
                <div className="mt-6">
                  <Link href="/investments"><Button className="transition-smooth bg-white text-teal-900 hover:bg-teal-50 hover:scale-105">See opportunity</Button></Link>
                </div>
              </div>
              <CardContent className="animate-slide-left flex flex-col justify-center bg-white p-10">
                <h4 className="text-xl font-semibold text-slate-900">Why invest with us</h4>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li className="animate-slide-left animate-delay-100">• Asset-backed investments — every naira tied to real property.</li>
                  <li className="animate-slide-left animate-delay-200">• Transparent reporting on project progress and returns.</li>
                  <li className="animate-slide-left animate-delay-300">• Flexible tenors from 6 to 36 months.</li>
                  <li className="animate-slide-left animate-delay-400">• Professional management with a verified track record.</li>
                </ul>
              </CardContent>
            </div>
          </Card>
        </section>
      ) : null}

      <section className="bg-slate-900 text-white">
        <div className="container-x py-20 text-center">
          <h3 className="animate-slide-up text-3xl font-bold">Ready to own or invest?</h3>
          <p className="animate-slide-up mt-3 text-slate-300 animate-delay-100">Talk to us today — we&apos;ll guide you through the best fit for your goals.</p>
          <div className="animate-slide-up mt-6 flex justify-center gap-3 animate-delay-200">
            <Link href="/contact"><Button size="lg" className="transition-smooth bg-teal-500 hover:bg-teal-600 hover:scale-105">Get in touch</Button></Link>
            <Link href="/buy-land"><Button size="lg" variant="outline" className="transition-smooth border-white/40 bg-transparent text-white hover:bg-white/10 hover:scale-105">Buy land</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-semibold text-teal-700 hover:underline">View all →</Link>
    </div>
  );
}

const services: {
  title: string;
  description: string;
  bullets: string[];
  href: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Real Estate Sales",
    description:
      "Verified land and quality homes across prime locations, with flexible payment plans and full documentation.",
    bullets: [
      "Land plots with registered titles",
      "Finished and off-plan housing",
      "Outright or installment options",
    ],
    href: "/land",
    Icon: Home,
  },
  {
    title: "Construction Services",
    description:
      "End-to-end construction for private clients and estates — from design and permits to turnover and handover.",
    bullets: [
      "Bungalows, duplexes, terraces",
      "Estate and infrastructure builds",
      "Project management & supervision",
    ],
    href: "/services",
    Icon: HardHat,
  },
  {
    title: "Real Estate Investment",
    description:
      "Grow wealth through asset-backed investment projects with transparent ROI and professional oversight.",
    bullets: [
      "Fixed-tenor investment products",
      "Asset-backed, property-tied returns",
      "Dashboard tracking & updates",
    ],
    href: "/investments",
    Icon: TrendingUp,
  },
];

const whyUs: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "Verified titles",
    body: "Registered, due-diligence-ready documentation on every plot and property.",
    Icon: ShieldCheck,
  },
  {
    title: "Flexible payment plans",
    body: "Outright or structured installments — 3, 6, 12 months and beyond.",
    Icon: Wallet,
  },
  {
    title: "Asset-backed returns",
    body: "Every investment is tied to real, identifiable property with transparent ROI.",
    Icon: TrendingUp,
  },
  {
    title: "Digital-first experience",
    body: "Track payments, download receipts, and see project progress from your dashboard.",
    Icon: MonitorSmartphone,
  },
];
