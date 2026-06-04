"use client";

import { useActionState } from "react";
import { submitLead, type LeadFormState } from "@/server/actions/leads";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: LeadFormState = { ok: false };

export function LeadForm({
  source,
  interestPlaceholder = "e.g. Buy land in Lekki",
  submitLabel = "Send message",
  withNote = true,
}: {
  source?: string;
  interestPlaceholder?: string;
  submitLabel?: string;
  withNote?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitLead, initial);
  if (state.ok) {
    return (
      <div className="animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <h3 className="font-semibold">Thanks! We got your details.</h3>
        <p className="mt-1 text-sm">A member of our team will reach out within 1 business day.</p>
      </div>
    );
  }
  return (
    <form action={formAction} className="space-y-4">
      {source ? <input type="hidden" name="source" value={source} /> : null}
      <div className="animate-slide-up animate-delay-100">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" className="transition-smooth focus:shadow-md" />
        {state.errors?.name ? <p className="animate-fade-in mt-1 text-xs text-red-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 animate-slide-up animate-delay-200">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required autoComplete="tel" placeholder="+234..." className="transition-smooth focus:shadow-md" />
          {state.errors?.phone ? <p className="animate-fade-in mt-1 text-xs text-red-600">{state.errors.phone[0]}</p> : null}
        </div>
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="transition-smooth focus:shadow-md" />
        </div>
      </div>
      <div className="animate-slide-up animate-delay-300">
        <Label htmlFor="interest">I&apos;m interested in</Label>
        <Input id="interest" name="interest" placeholder={interestPlaceholder} className="transition-smooth focus:shadow-md" />
      </div>
      {withNote ? (
        <div className="animate-slide-up animate-delay-400">
          <Label htmlFor="note">Additional note</Label>
          <Textarea id="note" name="note" rows={4} className="transition-smooth focus:shadow-md" />
        </div>
      ) : null}
      {state.message ? <p className="animate-fade-in text-sm text-red-600">{state.message}</p> : null}
      <Button type="submit" disabled={pending} size="lg" className="animate-slide-up w-full animate-delay-500">{pending ? "Sending…" : submitLabel}</Button>
    </form>
  );
}
