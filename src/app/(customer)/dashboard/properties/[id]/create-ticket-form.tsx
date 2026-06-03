"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPurchasePaymentTicket } from "@/server/actions/invoices";

export function CreatePurchaseTicketForm({ purchaseId }: { purchaseId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const fd = new FormData();
      fd.append("purchaseId", purchaseId);
      fd.append("amount", amount);
      if (notes) fd.append("notes", notes);
      const result = await createPurchasePaymentTicket(fd);
      if (result && result.ok) {
        toast.success("Payment ticket opened.");
        router.push(`/dashboard/payments/${result.id}`);
      } else {
        toast.error(result?.message ?? "Could not open ticket");
      }
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (NGN)</label>
        <Input type="number" min={1} step="1000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Notes (optional)</label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. June installment" />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Opening…" : "Open payment ticket"}</Button>
    </form>
  );
}
