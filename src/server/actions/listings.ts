"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const paymentPlanSchema = z.array(
  z.object({
    months: z.number().int().positive(),
    deposit: z.number().nonnegative().optional(),
    monthly: z.number().nonnegative(),
  })
);

const landSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  location: z.string().min(2),
  plotSizeSqm: z.coerce.number().int().positive().max(10000000),
  priceOutright: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().nonnegative().optional()),
  priceInstallment: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().nonnegative().optional()),
  paymentPlans: z.string().optional(),
  features: z.string().optional(),
  mapLat: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().optional()),
  mapLng: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().optional()),
  galleryKeys: z.string().optional(),
  brochureKey: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD_OUT", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageKey: z.string().optional(),
});

function parseJsonOr<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseJson<T>(raw: string | undefined) {
  if (!raw) return { success: true, data: [] as unknown as T };
  try {
    return { success: true, data: JSON.parse(raw) as T };
  } catch {
    return { success: false, error: "Invalid JSON" } as const;
  }
}

function parseCsv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function formatIssue(issue: { path: readonly PropertyKey[]; message: string } | undefined, fallback: string) {
  if (!issue) return fallback;
  const field = issue.path.map(String).join(".") || "Field";
  return `${field}: ${issue.message}`;
}

export async function upsertLandListing(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = landSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: formatIssue(parsed.error.issues[0], "Invalid input") } as const;
  const d = parsed.data;

  const plansResult = parseJson<unknown[]>(d.paymentPlans);
  if (!plansResult.success) return { ok: false, message: plansResult.error } as const;
  const plansValidated = paymentPlanSchema.safeParse(plansResult.data);
  if (!plansValidated.success) return { ok: false, message: formatIssue(plansValidated.error.issues[0], "Invalid payment plans") } as const;

  const data = {
    title: d.title,
    location: d.location,
    plotSizeSqm: d.plotSizeSqm,
    priceOutright: d.priceOutright != null ? String(d.priceOutright) : null,
    priceInstallment: d.priceInstallment != null ? String(d.priceInstallment) : null,
    paymentPlans: plansValidated.data,
    features: parseCsv(d.features),
    mapLat: d.mapLat ?? null,
    mapLng: d.mapLng ?? null,
    galleryKeys: parseCsv(d.galleryKeys),
    brochureKey: d.brochureKey || null,
    status: d.status,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    ogImageKey: d.ogImageKey || null,
  };

  if (d.id) {
    await prisma.landListing.update({ where: { id: d.id }, data });
  } else {
    let slug = slugify(d.title);
    const existing = await prisma.landListing.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.landListing.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/listings");
  revalidatePath("/land");
  redirect("/admin/listings");
}

const housingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  type: z.enum(["BUNGALOW", "DUPLEX", "TERRACE", "APARTMENT", "MAISONETTE", "PENTHOUSE", "OTHER"]),
  description: z.string().optional(),
  floorPlanKeys: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  paymentPlans: z.string().optional(),
  galleryKeys: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  bedrooms: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().nonnegative().optional()),
  bathrooms: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().nonnegative().optional()),
  location: z.string().min(2),
  brochureKey: z.string().optional(),
  features: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD_OUT", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageKey: z.string().optional(),
});

export async function upsertHousingListing(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = housingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: formatIssue(parsed.error.issues[0], "Invalid input") } as const;
  const d = parsed.data;

  const plansResult = parseJson<unknown[]>(d.paymentPlans);
  if (!plansResult.success) return { ok: false, message: plansResult.error } as const;
  const plansValidated = paymentPlanSchema.safeParse(plansResult.data);
  if (!plansValidated.success) return { ok: false, message: formatIssue(plansValidated.error.issues[0], "Invalid payment plans") } as const;

  const description = parseJsonOr(d.description, { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: d.description ?? "" }] }] });

  const data = {
    title: d.title,
    type: d.type,
    description,
    floorPlanKeys: parseCsv(d.floorPlanKeys),
    price: d.price,
    paymentPlans: plansValidated.success ? plansValidated.data : [],
    galleryKeys: parseCsv(d.galleryKeys),
    videoUrl: d.videoUrl || null,
    bedrooms: d.bedrooms ?? null,
    bathrooms: d.bathrooms ?? null,
    location: d.location,
    brochureKey: d.brochureKey || null,
    features: parseCsv(d.features),
    status: d.status,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    ogImageKey: d.ogImageKey || null,
  };

  if (d.id) {
    await prisma.housingListing.update({ where: { id: d.id }, data });
  } else {
    let slug = slugify(d.title);
    const existing = await prisma.housingListing.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.housingListing.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/listings");
  revalidatePath("/housing");
  redirect("/admin/listings");
}

const deleteSchema = z.object({ id: z.string().min(1), kind: z.enum(["LAND", "HOUSING"]) });

export async function deleteListing(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false } as const;
  if (parsed.data.kind === "LAND") {
    await prisma.landListing.delete({ where: { id: parsed.data.id } });
  } else {
    await prisma.housingListing.delete({ where: { id: parsed.data.id } });
  }
  revalidatePath("/admin/listings");
  revalidatePath("/land");
  revalidatePath("/housing");
  return { ok: true } as const;
}
