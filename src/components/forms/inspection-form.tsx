"use client";

import { useActionState } from "react";
import { bookInspection, type InspectionFormState } from "@/server/actions/bookings";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: InspectionFormState = { ok: false };

export function InspectionForm({ listingType, listingId }: { listingType: "LAND" | "HOUSING"; listingId: string }) {
  const [state, action, pending] = useActionState(bookInspection, initial);
  if (state.ok) {
    return (
      <div className="animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-semibold">Inspection booked 🎉</p>
        <p className="text-sm">Our team will confirm details with you shortly.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingType" value={listingType} />
      <input type="hidden" name="listingId" value={listingId} />
      <div className="animate-slide-up animate-delay-100">
        <Label htmlFor="bk-name">Name</Label>
        <Input id="bk-name" name="name" required className="transition-smooth focus:shadow-md" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 animate-slide-up animate-delay-200">
        <div>
          <Label htmlFor="bk-phone">Phone</Label>
          <Input id="bk-phone" name="phone" required className="transition-smooth focus:shadow-md" />
        </div>
        <div>
          <Label htmlFor="bk-email">Email (optional)</Label>
          <Input id="bk-email" name="email" type="email" className="transition-smooth focus:shadow-md" />
        </div>
      </div>
      <div className="animate-slide-up animate-delay-300">
        <Label htmlFor="bk-date">Preferred date</Label>
        <Input id="bk-date" name="preferredDate" type="date" required className="transition-smooth focus:shadow-md" />
      </div>
      <div className="animate-slide-up animate-delay-400">
        <Label htmlFor="bk-note">Note (optional)</Label>
        <Textarea id="bk-note" name="note" rows={3} className="transition-smooth focus:shadow-md" />
      </div>
      {state.message ? <p className="animate-fade-in text-sm text-red-600">{state.message}</p> : null}
      <Button type="submit" disabled={pending} className="animate-slide-up w-full animate-delay-500">{pending ? "Booking…" : "Book inspection"}</Button>
    </form>
  );
}
