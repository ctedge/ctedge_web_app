"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]),
});

export async function updateBookingStatus(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false } as const;
  await prisma.inspectionBooking.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  revalidatePath("/admin/bookings");
  return { ok: true } as const;
}
