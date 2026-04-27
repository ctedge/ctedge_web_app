"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { broadcastNotification } from "@/server/actions/broadcast";

export function BroadcastForm() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setStatus(null);
    start(async () => {
      const result = await broadcastNotification(formData);
      if (result.ok) setStatus(`Sent to ${result.count} user(s).`);
      else setStatus(result.message ?? "Could not broadcast");
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Audience</label>
        <select name="audience" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" required>
          <option value="ALL">Everyone (customers + investors)</option>
          <option value="CUSTOMERS">Customers only</option>
          <option value="INVESTORS">Investors only</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
        <Input name="title" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Body</label>
        <textarea name="body" rows={5} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Optional link</label>
        <Input name="url" placeholder="/land or https://…" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="sendEmail" value="on" defaultChecked /> Also send email
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{status}</p>
        <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send broadcast"}</Button>
      </div>
    </form>
  );
}
