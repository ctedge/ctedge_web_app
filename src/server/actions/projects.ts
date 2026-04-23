"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  status: z.enum(["ONGOING", "COMPLETED", "UPCOMING"]),
  description: z.string().min(1),
  galleryKeys: z.string().optional(),
  location: z.string().optional(),
  completionDate: z.string().optional(),
});

export async function upsertProject(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;
  const d = parsed.data;

  const data = {
    title: d.title,
    status: d.status,
    description: d.description,
    galleryKeys: d.galleryKeys ? d.galleryKeys.split(",").map((s) => s.trim()).filter(Boolean) : [],
    location: d.location || null,
    completionDate: d.completionDate ? new Date(d.completionDate) : null,
  };

  if (d.id) {
    await prisma.project.update({ where: { id: d.id }, data });
  } else {
    let slug = slugify(d.title);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    await prisma.project.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData) {
  await requireRole("ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false } as const;
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { ok: true } as const;
}

const invProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().min(1),
  minAmount: z.coerce.number().positive(),
  roiPercent: z.coerce.number().positive(),
  durationMonths: z.coerce.number().int().positive(),
  maturityDate: z.string().min(1),
  totalTarget: z.coerce.number().positive(),
  status: z.enum(["OPEN", "CLOSED", "MATURED"]),
  galleryKeys: z.string().optional(),
  docKeys: z.string().optional(),
});

export async function upsertInvestmentProject(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = invProjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;
  const d = parsed.data;

  const data = {
    title: d.title,
    description: d.description,
    minAmount: d.minAmount,
    roiPercent: d.roiPercent,
    durationMonths: d.durationMonths,
    maturityDate: new Date(d.maturityDate),
    totalTarget: d.totalTarget,
    status: d.status,
    galleryKeys: d.galleryKeys ? d.galleryKeys.split(",").map((s) => s.trim()).filter(Boolean) : [],
    docKeys: d.docKeys ? d.docKeys.split(",").map((s) => s.trim()).filter(Boolean) : [],
  };

  if (d.id) {
    await prisma.investmentProject.update({ where: { id: d.id }, data });
  } else {
    let slug = slugify(d.title);
    const existing = await prisma.investmentProject.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    await prisma.investmentProject.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/projects");
  revalidatePath("/investments");
  redirect("/admin/projects");
}
