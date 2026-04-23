"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { investInProject } from "@/server/actions/investments";

export function InvestForm({ projectId, minAmount }: { projectId: string; minAmount: number }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.append("projectId", projectId);
      fd.append("amount", amount);
      const result = await investInProject(fd);
      if (result && !result.ok) setError(result.message ?? "Could not submit");
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (NGN)</label>
        <Input type="number" min={minAmount} step="1000" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(minAmount)} required />
        <p className="mt-1 text-xs text-slate-500">Minimum ₦{minAmount.toLocaleString()}</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Submitting…" : "Submit investment"}</Button>
      <p className="text-xs text-slate-500">Your request goes to admin for review and funding instructions.</p>
    </form>
  );
}
