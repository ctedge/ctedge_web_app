"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { attachProof } from "@/server/actions/invoices";

export function UploadProof({ invoiceId }: { invoiceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function upload() {
    if (!file) return;
    setStatus("Uploading…");

    try {
      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", prefix: "proofs" }),
      });
      if (!presignRes.ok) throw new Error("Could not get upload URL");
      const { url, key } = (await presignRes.json()) as { url: string; key: string };

      const put = await fetch(url, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
      if (!put.ok) throw new Error("Upload failed");

      start(async () => {
        const fd = new FormData();
        fd.append("invoiceId", invoiceId);
        fd.append("proofKey", key);
        const result = await attachProof(fd);
        if (result.ok) {
          setStatus("Uploaded. Awaiting review.");
          setFile(null);
        } else {
          setStatus(result.message ?? "Could not attach proof");
        }
      });
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-52 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
        />
        <Button size="sm" onClick={upload} disabled={!file || pending}>
          {pending ? "Saving…" : "Upload proof"}
        </Button>
      </div>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
