"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertTestimonial } from "@/server/actions/testimonials";
import { RequiredMark } from "@/components/ui/required-mark";

type TestimonialData = {
  id?: string;
  authorName?: string;
  role?: "INVESTOR" | "CLIENT";
  quote?: string;
  company?: string | null;
  location?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialData }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    start(async () => {
      const result = await upsertTestimonial(formData);
      if (result && !result.ok) toast.error(result.message ?? "Could not save");
      else toast.success("Testimonial saved.");
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {testimonial?.id ? <input type="hidden" name="id" value={testimonial.id} /> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-700">Author</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Author name" required>
            <Input name="authorName" defaultValue={testimonial?.authorName ?? ""} required />
          </Field>
          <Field label="Role" required>
            <select
              name="role"
              defaultValue={testimonial?.role ?? "CLIENT"}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              required
            >
              <option value="CLIENT">Client</option>
              <option value="INVESTOR">Investor</option>
            </select>
          </Field>
          <Field label="Company (optional)">
            <Input name="company" defaultValue={testimonial?.company ?? ""} />
          </Field>
          <Field label="Location (optional)">
            <Input name="location" defaultValue={testimonial?.location ?? ""} placeholder="e.g. Lagos, Nigeria" />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Quote<RequiredMark /></h2>
        <textarea
          name="quote"
          rows={5}
          defaultValue={testimonial?.quote ?? ""}
          required
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm leading-relaxed"
          placeholder="What did they say about working with you?"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Display</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sort order">
            <Input
              type="number"
              name="sortOrder"
              defaultValue={testimonial?.sortOrder ?? 0}
              placeholder="Lower numbers appear first"
            />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                defaultChecked={testimonial?.published ?? true}
                className="h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span className="text-sm font-medium text-slate-700">Show on public site</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/testimonials")}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : testimonial?.id ? "Update testimonial" : "Create testimonial"}
        </Button>
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
