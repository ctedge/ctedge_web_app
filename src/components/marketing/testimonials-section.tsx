import { prisma } from "@/lib/db";
import { TestimonialsCarousel, type TestimonialItem } from "./testimonials-carousel";

export async function TestimonialsSection({ background = "white" }: { background?: "white" | "muted" }) {
  const items = await prisma.testimonial
    .findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    .catch(() => []);

  if (items.length === 0) return null;

  const carouselItems: TestimonialItem[] = items.map((t) => ({
    id: t.id,
    authorName: t.authorName,
    role: t.role,
    quote: t.quote,
    company: t.company,
    location: t.location,
  }));

  return (
    <section className={background === "muted" ? "bg-slate-50" : "bg-white"}>
      <div className="container-x py-20">
        <div className="animate-fade-in text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">What people say</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Voices of trust.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Real stories from clients and investors who&apos;ve built with us.
          </p>
        </div>
        <div className="mt-12 animate-scale-in">
          <TestimonialsCarousel items={carouselItems} />
        </div>
      </div>
    </section>
  );
}
