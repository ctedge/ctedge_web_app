"use client";

import { useActionState, useState } from "react";
import { submitLead, type LeadFormState } from "@/server/actions/leads";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: LeadFormState = { ok: false };

const SERVICES = [
  "General enquiry",
  "Residential builds",
  "Commercial developments",
  "Estate infrastructure",
  "Renovations",
  "Project management",
  "BOQ & architectural design",
];

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(submitLead, initial);
  const [service, setService] = useState(SERVICES[0]);

  if (state.ok) {
    return (
      <div className="animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <h3 className="font-semibold">Thanks! We got your enquiry.</h3>
        <p className="mt-1 text-sm">A member of our team will reach out within 1 business day.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="source" value="enquiry-widget" />
      <input type="hidden" name="interest" value={`Enquiry: ${service}`} />

      <div className="animate-slide-up animate-delay-100">
        <Label htmlFor="enquiry-service">Service</Label>
        <Select
          id="enquiry-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="transition-smooth focus:shadow-md"
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="animate-slide-up animate-delay-200">
        <Label htmlFor="enquiry-name">Full name</Label>
        <Input id="enquiry-name" name="name" required autoComplete="name" className="transition-smooth focus:shadow-md" />
        {state.errors?.name ? <p className="animate-fade-in mt-1 text-xs text-red-600">{state.errors.name[0]}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-slide-up animate-delay-300">
        <div>
          <Label htmlFor="enquiry-phone">Phone</Label>
          <Input id="enquiry-phone" name="phone" required autoComplete="tel" placeholder="+234..." className="transition-smooth focus:shadow-md" />
          {state.errors?.phone ? <p className="animate-fade-in mt-1 text-xs text-red-600">{state.errors.phone[0]}</p> : null}
        </div>
        <div>
          <Label htmlFor="enquiry-email">Email (optional)</Label>
          <Input id="enquiry-email" name="email" type="email" autoComplete="email" className="transition-smooth focus:shadow-md" />
        </div>
      </div>

      <div className="animate-slide-up animate-delay-400">
        <Label htmlFor="enquiry-note">Tell us a bit more</Label>
        <Textarea id="enquiry-note" name="note" rows={4} className="transition-smooth focus:shadow-md" />
      </div>

      {state.message ? <p className="animate-fade-in text-sm text-red-600">{state.message}</p> : null}

      <Button type="submit" disabled={pending} size="lg" className="animate-slide-up w-full animate-delay-500">
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
