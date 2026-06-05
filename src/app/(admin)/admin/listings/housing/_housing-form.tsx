"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertHousingListing } from "@/server/actions/listings";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PaymentPlansEditor } from "@/components/admin/payment-plans-editor";
import { AmenitiesChecklist } from "@/components/admin/amenities-checklist";

type HousingData = {
  id?: string;
  title?: string;
  type?: string;
  description?: unknown;
  floorPlanKeys?: string[];
  price?: unknown;
  paymentPlans?: unknown;
  galleryKeys?: string[];
  videoUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  location?: string;
  brochureKey?: string | null;
  features?: string[];
  status?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageKey?: string | null;
};

export function HousingListingForm({ listing }: { listing?: HousingData }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<string[]>(listing?.galleryKeys ?? []);
  const [floor, setFloor] = useState<string[]>(listing?.floorPlanKeys ?? []);
  const [brochure, setBrochure] = useState<string>(listing?.brochureKey ?? "");
  const [og, setOg] = useState<string>(listing?.ogImageKey ?? "");
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("galleryKeys", gallery.join(","));
    formData.set("floorPlanKeys", floor.join(","));
    if (brochure) formData.set("brochureKey", brochure); else formData.delete("brochureKey");
    if (og) formData.set("ogImageKey", og); else formData.delete("ogImageKey");
    start(async () => {
      const result = await upsertHousingListing(formData);
      if (result && !result.ok) {
        toast.error(result.message ?? "Could not save");
        return;
      }
      toast.success("Listing saved.");
      router.push("/admin/listings");
    });
  }

  const descriptionText = tiptapToText(listing?.description);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      {listing?.id ? <input type="hidden" name="id" value={listing.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input name="title" defaultValue={listing?.title ?? ""} required /></Field>
        <Field label="Type">
          <select name="type" defaultValue={listing?.type ?? "BUNGALOW"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
            {["BUNGALOW", "DUPLEX", "TERRACE", "APARTMENT", "MAISONETTE", "PENTHOUSE", "OTHER"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Location"><Input name="location" defaultValue={listing?.location ?? ""} required /></Field>
        <Field label="Price (NGN)"><Input name="price" type="number" step="0.01" defaultValue={listing?.price ? String(listing.price) : ""} required /></Field>
        <Field label="Bedrooms"><Input name="bedrooms" type="number" defaultValue={listing?.bedrooms ?? ""} /></Field>
        <Field label="Bathrooms"><Input name="bathrooms" type="number" defaultValue={listing?.bathrooms ?? ""} /></Field>
        <Field label="Video URL"><Input name="videoUrl" type="url" defaultValue={listing?.videoUrl ?? ""} placeholder="https://…" /></Field>
        <Field label="Status">
          <select name="status" defaultValue={listing?.status ?? "DRAFT"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="SOLD_OUT">SOLD_OUT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" rows={6} defaultValue={descriptionText} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm" />
        <p className="mt-1 text-xs text-slate-500">Plain text is fine; stored as TipTap JSON automatically.</p>
      </Field>

      <Field label="Features & amenities">
        <AmenitiesChecklist defaultValue={listing?.features ?? []} />
      </Field>

      <Field label="Payment plans">
        <PaymentPlansEditor defaultValue={listing?.paymentPlans as [] | undefined} />
      </Field>

      <Field label="Gallery">
        <MediaUploader prefix="listings" value={gallery} onChange={setGallery} accept="image/*" multiple />
      </Field>

      <Field label="Floor plans">
        <MediaUploader prefix="listings" value={floor} onChange={setFloor} accept="image/*" multiple />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brochure (PDF)">
          <MediaUploader prefix="brochures" value={brochure ? [brochure] : []} onChange={(v) => setBrochure(v[0] ?? "")} accept="application/pdf" />
        </Field>
        <Field label="OG image">
          <MediaUploader prefix="listings" value={og ? [og] : []} onChange={(v) => setOg(v[0] ?? "")} accept="image/*" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title"><Input name="seoTitle" defaultValue={listing?.seoTitle ?? ""} /></Field>
        <Field label="SEO description"><Input name="seoDescription" defaultValue={listing?.seoDescription ?? ""} /></Field>
      </div>


      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/listings")}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save listing"}</Button>
      </div>
    </form>
  );
}

type TipTapLike = { type?: string; text?: string; content?: TipTapLike[] };

function tiptapToText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const collect = (node: TipTapLike): string => {
    if (!node) return "";
    if (node.type === "text") return node.text ?? "";
    const inner = (node.content ?? []).map(collect).join("");
    if (node.type === "paragraph" || node.type === "heading" || node.type === "listItem") return inner + "\n";
    return inner;
  };
  return collect(value as TipTapLike).replace(/\n+$/, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
