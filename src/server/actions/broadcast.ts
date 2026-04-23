"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { sendMail } from "@/lib/mailer";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

const schema = z.object({
  audience: z.enum(["ALL", "CUSTOMERS", "INVESTORS"]),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
  sendEmail: z.enum(["on", "off"]).optional(),
});

export async function broadcastNotification(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;
  const d = parsed.data;

  const roleFilter =
    d.audience === "CUSTOMERS"
      ? { role: Role.CUSTOMER }
      : d.audience === "INVESTORS"
        ? { role: Role.INVESTOR }
        : { role: { in: [Role.CUSTOMER, Role.INVESTOR] } };
  const recipients = await prisma.user.findMany({ where: roleFilter, select: { id: true, email: true } });

  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      title: d.title,
      body: d.body,
      type: "INFO" as const,
      url: d.url || null,
    })),
  });

  if (d.sendEmail === "on") {
    await Promise.all(
      recipients
        .filter((r) => r.email)
        .map((r) =>
          sendMail({
            to: r.email,
            subject: d.title,
            html: `<p>${d.body}</p>${d.url ? `<p><a href="${d.url}">Open</a></p>` : ""}`,
            text: `${d.body}${d.url ? `\n\n${d.url}` : ""}`,
          }).catch(() => null)
        )
    );
  }

  revalidatePath("/admin/notifications");
  return { ok: true, count: recipients.length } as const;
}
