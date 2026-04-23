"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertInvestmentProject } from "@/server/actions/projects";
import { MediaUploader } from "@/components/admin/media-uploader";

type InvProjectData = {
  id?: string;
  title?: string;
  description?: string;
  minAmount?: unknown;
  roiPercent?: number;
  durationMonths?: number;
  maturityDate?: Date;
  totalTarget?: unknown;
  status?: string;
  galleryKeys?: string[];
  docKeys?: string[];
};

export function InvestmentProjectForm({ project }: { project?: InvProjectData }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<string[]>(project?.galleryKeys ?? []);
  const [docs, setDocs] = useState<string[]>(project?.docKeys ?? []);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("galleryKeys", gallery.join(","));
    formData.set("docKeys", docs.join(","));
    start(async () => {
      const result = await upsertInvestmentProject(formData);
      if (result && !result.ok) setError(result.message ?? "Could not save");
      else router.push("/admin/projects");
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input name="title" defaultValue={project?.title ?? ""} required /></Field>
        <Field label="Status">
          <select name="status" defaultValue={project?.status ?? "OPEN"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="MATURED">MATURED</option>
          </select>
        </Field>
        <Field label="Minimum amount (NGN)"><Input name="minAmount" type="number" step="0.01" defaultValue={project?.minAmount ? String(project.minAmount) : ""} required /></Field>
        <Field label="Target raise (NGN)"><Input name="totalTarget" type="number" step="0.01" defaultValue={project?.totalTarget ? String(project.totalTarget) : ""} required /></Field>
        <Field label="ROI (%)"><Input name="roiPercent" type="number" step="0.01" defaultValue={project?.roiPercent ?? ""} required /></Field>
        <Field label="Duration (months)"><Input name="durationMonths" type="number" defaultValue={project?.durationMonths ?? ""} required /></Field>
        <Field label="Maturity date"><Input name="maturityDate" type="date" defaultValue={project?.maturityDate ? project.maturityDate.toISOString().slice(0, 10) : ""} required /></Field>
      </div>

      <Field label="Description">
        <textarea name="description" rows={6} defaultValue={project?.description ?? ""} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" required />
      </Field>

      <Field label="Gallery">
        <MediaUploader prefix="investments" value={gallery} onChange={setGallery} accept="image/*" multiple />
      </Field>

      <Field label="Documents (prospectus, agreements template)">
        <MediaUploader prefix="investments" value={docs} onChange={setDocs} accept="application/pdf" multiple />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/projects")}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save project"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
