"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { assignDocument } from "@/server/actions/documents";

export function AssignDocumentForm({ users }: { users: { id: string; name: string | null; email: string; role: string }[] }) {
  const [key, setKey] = useState<string>("");
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    if (!key) { setStatus("Upload a document first"); return; }
    formData.set("r2Key", key);
    start(async () => {
      const result = await assignDocument(formData);
      if (result.ok) {
        setStatus("Assigned");
        setKey("");
      } else {
        setStatus(result.message ?? "Could not assign");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Recipient</label>
        <select name="ownerUserId" required className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
          <option value="">Choose user…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name ?? u.email} · {u.role}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Kind</label>
        <select name="kind" required className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
          {["ALLOCATION", "RECEIPT", "AGREEMENT", "KYC", "OTHER"].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
        <Input name="title" required placeholder="e.g. Allocation letter · Plot 12" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-slate-600">File</label>
        <MediaUploader prefix="documents" value={key ? [key] : []} onChange={(v) => setKey(v[0] ?? "")} accept="application/pdf,image/*" />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">{status}</p>
        <Button type="submit" disabled={pending}>{pending ? "Assigning…" : "Assign document"}</Button>
      </div>
    </form>
  );
}
