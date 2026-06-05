"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertProject } from "@/server/actions/projects";
import { MediaUploader } from "@/components/admin/media-uploader";
import { RequiredMark } from "@/components/ui/required-mark";

type ProjectData = {
  id?: string;
  title?: string;
  status?: string;
  description?: string;
  galleryKeys?: string[];
  location?: string | null;
  completionDate?: Date | null;
};

export function PortfolioProjectForm({ project }: { project?: ProjectData }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<string[]>(project?.galleryKeys ?? []);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    formData.set("galleryKeys", gallery.join(","));
    start(async () => {
      const result = await upsertProject(formData);
      if (result && !result.ok) {
        toast.error(result.message ?? "Could not save");
      } else {
        toast.success("Project saved.");
        router.push("/admin/projects");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" required><Input name="title" defaultValue={project?.title ?? ""} required /></Field>
        <Field label="Status">
          <select name="status" defaultValue={project?.status ?? "ONGOING"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="UPCOMING">UPCOMING</option>
          </select>
        </Field>
        <Field label="Location"><Input name="location" defaultValue={project?.location ?? ""} /></Field>
        <Field label="Completion date"><Input name="completionDate" type="date" defaultValue={project?.completionDate ? project.completionDate.toISOString().slice(0, 10) : ""} /></Field>
      </div>

      <Field label="Description" required>
        <textarea name="description" rows={6} defaultValue={project?.description ?? ""} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" required />
      </Field>

      <Field label="Gallery">
        <MediaUploader prefix="projects" value={gallery} onChange={setGallery} accept="image/*" multiple />
      </Field>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/projects")}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save project"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {children}
    </div>
  );
}
