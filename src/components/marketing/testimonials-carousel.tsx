"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export type TestimonialItem = {
  id: string;
  authorName: string;
  role: "INVESTOR" | "CLIENT";
  quote: string;
  company: string | null;
  location: string | null;
};

const AUTOPLAY_MS = 6000;

export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;

  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setActive(((next % total) + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, total]);

  if (total === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      className="relative mx-auto max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm md:px-16 md:py-16">
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-600 text-white shadow-lg ring-8 ring-white">
            <Quote className="h-6 w-6" />
          </div>
        </div>

        <div className="relative min-h-[260px] md:min-h-[220px]">
          {items.map((t, idx) => {
            const isActive = idx === active;
            return (
              <article
                key={t.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ease-out ${
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "pointer-events-none opacity-0 translate-y-2"
                }`}
              >
                <p className="text-lg italic leading-relaxed text-slate-800 md:text-2xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-8 flex flex-col items-center gap-2">
                  <span className="text-base font-semibold text-slate-900">{t.authorName}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      t.role === "INVESTOR"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t.role === "INVESTOR" ? "Investor" : "Client"}
                  </span>
                  {(t.company || t.location) && (
                    <span className="text-xs text-slate-500">
                      {[t.company, t.location].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous testimonial"
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-smooth hover:bg-teal-50 hover:text-teal-700 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 md:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next testimonial"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-smooth hover:bg-teal-50 hover:text-teal-700 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 md:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Choose testimonial">
          {items.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => go(idx)}
              className={`h-2 rounded-full transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                idx === active ? "w-8 bg-teal-600" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
