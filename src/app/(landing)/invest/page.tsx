import type { Metadata } from "next";
import { LandingHero, LandingTestimonials } from "@/components/marketing/landing-hero";

export const metadata: Metadata = { title: "Real Estate Investment — earn up to 18% ROI" };

export default function InvestLanding() {
  return (
    <>
      <LandingHero
        eyebrow="Real Estate Investment"
        heading="Earn up to 18% ROI on asset-backed real estate."
        bullets={[
          "Every investment is tied to real, verifiable property assets.",
          "Tenors from 6 to 36 months — pick what fits your plan.",
          "Transparent dashboards, agreements, and disbursement tracking.",
        ]}
        source="invest-landing"
        submitLabel="Speak to an advisor"
      />
      <LandingTestimonials />
    </>
  );
}
