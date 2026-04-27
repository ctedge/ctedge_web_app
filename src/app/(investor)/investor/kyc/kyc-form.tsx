"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitInvestorKyc } from "@/server/actions/kyc";

export function KycForm({
  currentBank,
  uploadedCount,
}: {
  currentBank: { bankName: string; bankAccount: string; bankAccName: string };
  uploadedCount: number;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState(currentBank);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function submit() {
    if (!file) {
      setStatus("Please choose a document to upload");
      return;
    }
    setStatus("Uploading…");
    try {
      const presign = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", prefix: "kyc" }),
      });
      if (!presign.ok) throw new Error("Could not get upload URL");
      const { url, key } = (await presign.json()) as { url: string; key: string };
      const put = await fetch(url, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
      if (!put.ok) throw new Error("Upload failed");

      start(async () => {
        const fd = new FormData();
        fd.append("docKey", key);
        if (bank.bankName) fd.append("bankName", bank.bankName);
        if (bank.bankAccount) fd.append("bankAccount", bank.bankAccount);
        if (bank.bankAccName) fd.append("bankAccName", bank.bankAccName);
        const result = await submitInvestorKyc(fd);
        if (result.ok) {
          setStatus("Submitted for review");
          setFile(null);
        } else {
          setStatus(result.message ?? "Could not submit");
        }
      });
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Identity document</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
        />
        {uploadedCount > 0 ? <p className="mt-1 text-xs text-slate-500">{uploadedCount} document(s) already on file.</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Bank name</label>
          <Input value={bank.bankName} onChange={(e) => setBank((b) => ({ ...b, bankName: e.target.value }))} placeholder="GTBank" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Account number</label>
          <Input value={bank.bankAccount} onChange={(e) => setBank((b) => ({ ...b, bankAccount: e.target.value }))} placeholder="0123456789" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Account name</label>
          <Input value={bank.bankAccName} onChange={(e) => setBank((b) => ({ ...b, bankAccName: e.target.value }))} placeholder="Full name on account" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Submit for review"}</Button>
        {status ? <p className="text-sm text-slate-500">{status}</p> : null}
      </div>
    </div>
  );
}
