import type { Metadata } from "next";
import { LandingHero, LandingTestimonials } from "@/components/marketing/landing-hero";

export const metadata: Metadata = { title: "Construction Services — build with confidence" };

export default function ConstructionLanding() {
  return (
    <>
      <LandingHero
        eyebrow="Construction Services"
        heading="Build your home — delivered on time, on budget."
        bullets={[
          "Turnkey residential and commercial builds across Nigeria.",
          "In-house architects, quantity surveyors, and site engineers.",
          "Weekly progress reports with photos and milestones.",
        ]}
        source="construction-landing"
        submitLabel="Request a quote"
      />
      <LandingTestimonials />
    </>
  );
}
