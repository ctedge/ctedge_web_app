"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

const idSchema = z.object({ id: z.string().min(1) });

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const parsed = idSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false } as const;

  await prisma.notification.updateMany({
    where: { id: parsed.data.id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  revalidatePath("/investor/notifications");
  return { ok: true } as const;
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/investor/notifications");
  return { ok: true } as const;
}
