"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Option = { id: string; label: string };

export function NewInvoiceForm({
  customers,
  landListings,
  housingListings,
  investments,
  defaultTarget,
  defaultCustomerId,
  defaultInvestmentId,
  action,
}: {
  customers: Option[];
  landListings: Option[];
  housingListings: Option[];
  investments: Option[];
  defaultTarget: "PURCHASE" | "INVESTMENT";
  defaultCustomerId?: string;
  defaultInvestmentId?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [target, setTarget] = useState<"PURCHASE" | "INVESTMENT">(defaultTarget);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Target</label>
        <select
          name="target"
          value={target}
          onChange={(e) => setTarget(e.target.value as "PURCHASE" | "INVESTMENT")}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          required
        >
          <option value="PURCHASE">Property purchase</option>
          <option value="INVESTMENT">Investment</option>
        </select>
      </div>

      {target === "PURCHASE" ? (
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Customer</label>
            <select name="customerId" defaultValue={defaultCustomerId ?? ""} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" required>
              <option value="">Choose customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Property</label>
            <select name="listing" defaultValue="" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" required>
              <option value="">Choose property…</option>
              <optgroup label="Land">
                {landListings.map((l) => (
                  <option key={l.id} value={`LAND:${l.id}`}>{l.label}</option>
                ))}
              </optgroup>
              <optgroup label="Housing">
                {housingListings.map((h) => (
                  <option key={h.id} value={`HOUSING:${h.id}`}>{h.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Payment mode</label>
            <select name="paymentMode" defaultValue="OUTRIGHT" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
              <option value="OUTRIGHT">Outright</option>
              <option value="INSTALLMENT">Installment</option>
            </select>
          </div>
        </>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Investment</label>
          <select name="investmentId" defaultValue={defaultInvestmentId ?? ""} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" required>
            <option value="">Choose investment…</option>
            {investments.map((i) => (
              <option key={i.id} value={i.id}>{i.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (NGN)</label>
          <Input name="amount" type="number" step="0.01" required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
          <Input name="dueAt" type="date" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
        <textarea name="notes" rows={3} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Create invoice</Button>
      </div>
    </form>
  );
}
