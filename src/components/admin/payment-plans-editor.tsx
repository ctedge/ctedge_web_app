"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Plan = { label: string; months: string; deposit: string; monthly: string };

const empty = (): Plan => ({ label: "", months: "", deposit: "", monthly: "" });

function toRows(value: Array<{ months?: number; deposit?: number; monthly?: number; label?: string }> | undefined): Plan[] {
  if (!value || value.length === 0) return [empty()];
  return value.map((p) => ({
    label: p.label ?? "",
    months: p.months != null ? String(p.months) : "",
    deposit: p.deposit != null ? String(p.deposit) : "",
    monthly: p.monthly != null ? String(p.monthly) : "",
  }));
}

function toJson(rows: Plan[]): string {
  const plans = rows
    .filter((r) => r.months.trim() !== "")
    .map((r) => ({
      ...(r.label.trim() ? { label: r.label.trim() } : {}),
      months: Number(r.months),
      ...(r.deposit.trim() ? { deposit: Number(r.deposit) } : {}),
      ...(r.monthly.trim() ? { monthly: Number(r.monthly) } : {}),
    }));
  return JSON.stringify(plans);
}

interface Props {
  defaultValue?: Array<{ months?: number; deposit?: number; monthly?: number; label?: string }>;
}

export function PaymentPlansEditor({ defaultValue }: Props) {
  const [rows, setRows] = useState<Plan[]>(() => toRows(defaultValue));

  function update(index: number, field: keyof Plan, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, empty()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="paymentPlans" value={toJson(rows)} />

      <div className="hidden grid-cols-[1fr_80px_130px_130px_32px] gap-2 text-xs font-semibold text-slate-500 md:grid">
        <span>Label (optional)</span>
        <span>Months</span>
        <span>Deposit (₦)</span>
        <span>Monthly (₦)</span>
        <span />
      </div>

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_80px_130px_130px_32px]">
          <Input
            placeholder="e.g. 6-month plan"
            value={row.label}
            onChange={(e) => update(i, "label", e.target.value)}
            className="col-span-2 md:col-span-1"
          />
          <Input
            type="number"
            placeholder="Months"
            min={1}
            value={row.months}
            onChange={(e) => update(i, "months", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Deposit"
            min={0}
            value={row.deposit}
            onChange={(e) => update(i, "deposit", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Monthly"
            min={0}
            value={row.monthly}
            onChange={(e) => update(i, "monthly", e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            disabled={rows.length === 1}
            className="flex h-10 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-0"
            title="Remove plan"
          >
            ✕
          </button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        + Add plan
      </Button>
    </div>
  );
}
