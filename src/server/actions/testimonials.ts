"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const testimonialSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().min(1),
  role: z.enum(["INVESTOR", "CLIENT"]),
  quote: z.string().min(1),
  company: z.string().optional(),
  location: z.string().optional(),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()).optional(),
  published: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).optional(),
});

export async function upsertTestimonial(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;
  const d = parsed.data;

  const data = {
    authorName: d.authorName,
    role: d.role,
    quote: d.quote,
    company: d.company || null,
    location: d.location || null,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? false,
  };

  if (d.id) {
    await prisma.testimonial.update({ where: { id: d.id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  await requireRole("ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false } as const;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/testimonials");
  return { ok: true } as const;
}
