"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { attachProof } from "@/server/actions/invoices";

export function TicketPaidForm({ invoiceId, initialProofKey, alreadySubmitted }: { invoiceId: string; initialProofKey?: string | null; alreadySubmitted?: boolean }) {
  const [proofKey, setProofKey] = useState<string>(initialProofKey ?? "");
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<boolean>(!!alreadySubmitted);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", prefix: "proofs" }),
      });
      if (!res.ok) throw new Error("Could not get upload URL");
      const { url, key } = (await res.json()) as { url: string; key: string };
      const put = await fetch(url, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
      if (!put.ok) throw new Error("Upload failed");
      setProofKey(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    if (!proofKey) return;
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.append("invoiceId", invoiceId);
      fd.append("proofKey", proofKey);
      const result = await attachProof(fd);
      if (result && !result.ok) setError(result.message ?? "Could not submit");
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Thank you. We&apos;ve received your confirmation and the admin team will review the proof shortly.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Proof of payment</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
        />
        {busy ? <p className="mt-1 text-xs text-slate-500">Uploading…</p> : null}
        {proofKey && !busy ? <p className="mt-1 text-xs text-emerald-700">Proof attached.</p> : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={submit} disabled={!proofKey || busy || pending} className="w-full">
        {pending ? "Submitting…" : "I have paid"}
      </Button>
      <p className="text-xs text-slate-500">After your transfer, attach the receipt or screenshot above, then click <strong>I have paid</strong>. Admin will verify and approve.</p>
    </div>
  );
}
