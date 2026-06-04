import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/forms/lead-form";

export function LandingHero({
  eyebrow,
  heading,
  bullets,
  source,
  submitLabel,
}: {
  eyebrow: string;
  heading: string;
  bullets: string[];
  source: string;
  submitLabel: string;
}) {
  return (
    <section className="bg-gradient-to-br from-teal-900 to-emerald-700 text-white">
      <div className="container-x grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{heading}</h1>
          <ul className="mt-6 space-y-3 text-teal-100">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-teal-300" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Get started today</CardTitle></CardHeader>
            <CardContent>
              <LeadForm source={source} submitLabel={submitLabel} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function LandingTestimonials() {
  const items = [
    { quote: "Best real estate investment decision I&apos;ve made. The process was transparent from end to end.", author: "Tolu A., Lagos" },
    { quote: "I got my C of O exactly when promised. No stories.", author: "Ifeoma N., Abuja" },
    { quote: "Flexible installments helped me own land without breaking my budget.", author: "Kunle B., Ibadan" },
  ];
  return (
    <section className="bg-white">
      <div className="container-x py-16">
        <h2 className="text-2xl font-bold text-slate-900">What our customers say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <blockquote key={i} className="rounded-xl border border-slate-200 p-6">
              <p className="text-slate-700" dangerouslySetInnerHTML={{ __html: `“${t.quote}”` }} />
              <footer className="mt-4 text-sm font-semibold text-teal-700">— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
