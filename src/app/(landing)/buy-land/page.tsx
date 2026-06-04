import type { Metadata } from "next";
import { LandingHero, LandingTestimonials } from "@/components/marketing/landing-hero";

export const metadata: Metadata = { title: "Buy Land | flexible payment plans" };

export default function BuyLandLanding() {
  return (
    <>
      <LandingHero
        eyebrow="Buy Land"
        heading="Own prime land. Up to 12-month flexible payment plans."
        bullets={[
          "Verified titles: C of O, R of O, and government-approved estates.",
          "From ₦18M outright, with installments starting from ₦1.5M/month.",
          "Free site inspection. Allocation letter issued on full payment.",
        ]}
        source="buy-land-landing"
        submitLabel="Get a land offer"
      />
      <LandingTestimonials />
    </>
  );
}
