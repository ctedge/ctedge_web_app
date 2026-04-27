"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

const schema = z.object({
  ownerUserId: z.string().min(1),
  kind: z.enum(["ALLOCATION", "RECEIPT", "AGREEMENT", "KYC", "OTHER"]),
  title: z.string().min(1),
  r2Key: z.string().min(1),
});

export async function assignDocument(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  await prisma.document.create({ data: parsed.data });

  await notify({
    userId: parsed.data.ownerUserId,
    title: "New document available",
    body: `${parsed.data.title} has been added to your dashboard.`,
    type: "INFO",
    url: "/dashboard/documents",
  });

  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath("/investor/documents");
  return { ok: true } as const;
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteDocument(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false } as const;
  await prisma.document.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin/documents");
  return { ok: true } as const;
}
