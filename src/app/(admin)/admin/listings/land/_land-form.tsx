"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertLandListing } from "@/server/actions/listings";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PaymentPlansEditor } from "@/components/admin/payment-plans-editor";
import { FeaturesEditor } from "@/components/admin/features-editor";

type LandData = {
  id?: string;
  title?: string;
  location?: string;
  plotSizeSqm?: number;
  priceOutright?: unknown;
  priceInstallment?: unknown;
  paymentPlans?: unknown;
  features?: string[];
  mapLat?: number | null;
  mapLng?: number | null;
  galleryKeys?: string[];
  brochureKey?: string | null;
  status?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageKey?: string | null;
};

export function LandListingForm({ listing }: { listing?: LandData }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<string[]>(listing?.galleryKeys ?? []);
  const [brochure, setBrochure] = useState<string>(listing?.brochureKey ?? "");
  const [og, setOg] = useState<string>(listing?.ogImageKey ?? "");
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    formData.set("galleryKeys", gallery.join(","));
    if (brochure) formData.set("brochureKey", brochure); else formData.delete("brochureKey");
    if (og) formData.set("ogImageKey", og); else formData.delete("ogImageKey");
    start(async () => {
      const result = await upsertLandListing(formData);
      if (result && !result.ok) {
        toast.error(result.message ?? "Could not save");
      } else {
        toast.success("Listing saved.");
        router.push("/admin/listings");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      {listing?.id ? <input type="hidden" name="id" value={listing.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input name="title" defaultValue={listing?.title ?? ""} required /></Field>
        <Field label="Location"><Input name="location" defaultValue={listing?.location ?? ""} required /></Field>
        <Field label="Plot size (sqm)"><Input name="plotSizeSqm" type="number" defaultValue={listing?.plotSizeSqm ?? ""} required /></Field>
        <Field label="Status">
          <select name="status" defaultValue={listing?.status ?? "DRAFT"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="SOLD_OUT">SOLD_OUT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </Field>
        <Field label="Outright price (NGN)"><Input name="priceOutright" type="number" step="0.01" defaultValue={listing?.priceOutright ? String(listing.priceOutright) : ""} /></Field>
        <Field label="Starting installment (NGN)"><Input name="priceInstallment" type="number" step="0.01" defaultValue={listing?.priceInstallment ? String(listing.priceInstallment) : ""} /></Field>
        <Field label="Latitude"><Input name="mapLat" type="number" step="0.000001" defaultValue={listing?.mapLat ?? ""} /></Field>
        <Field label="Longitude"><Input name="mapLng" type="number" step="0.000001" defaultValue={listing?.mapLng ?? ""} /></Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">Tip: open Google Maps, right-click the exact spot, and click the coordinates at the top of the menu to copy them.</p>

      <Field label="Features">
        <FeaturesEditor defaultValue={listing?.features ?? []} />
      </Field>

      <Field label="Payment plans">
        <PaymentPlansEditor defaultValue={listing?.paymentPlans as [] | undefined} />
      </Field>

      <Field label="Gallery">
        <MediaUploader prefix="listings" value={gallery} onChange={setGallery} accept="image/*" multiple />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
