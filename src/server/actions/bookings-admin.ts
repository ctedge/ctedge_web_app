"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mailer";
import { format } from "date-fns";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]),
});

const STATUS_COPY: Record<string, { subject: (t: string) => string; body: (date: string, t: string) => string }> = {
  SCHEDULED: {
    subject: (t) => `Your inspection for ${t} has been scheduled`,
    body: (date, t) => `Good news — your inspection for "${t}" has been scheduled for ${date}. We look forward to seeing you. If you need to reschedule, simply reply to this email.`,
  },
  COMPLETED: {
    subject: (t) => `Thanks for inspecting ${t}`,
    body: (_date, t) => `Thank you for attending the inspection for "${t}". If you have any follow-up questions or would like to proceed, just reply to this email.`,
  },
  CANCELLED: {
    subject: (t) => `Your inspection for ${t} has been cancelled`,
    body: (date, t) => `Your inspection for "${t}" originally set for ${date} has been cancelled. If this was unexpected or you'd like to rebook, please reply to this email.`,
  },
};

export async function updateBookingStatus(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false } as const;

  const booking = await prisma.inspectionBooking.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    include: { land: { select: { title: true } }, housing: { select: { title: true } } },
  });

  const copy = STATUS_COPY[parsed.data.status];
  if (copy && booking.email) {
    const listingTitle = booking.land?.title ?? booking.housing?.title ?? "your property";
    const dateStr = format(booking.preferredDate, "EEEE, MMM d, yyyy");
    const subject = copy.subject(listingTitle);
    const text = `Hi ${booking.name},\n\n${copy.body(dateStr, listingTitle)}\n\nThanks,\nThe team`;
    const html = `<p>Hi ${booking.name},</p><p>${copy.body(dateStr, listingTitle)}</p><p>Thanks,<br/>The team</p>`;
    try {
      await sendMail({ to: booking.email, subject, html, text });
    } catch (e) {
      console.error("[bookings] Failed to notify customer", e);
    }
  }

  revalidatePath("/admin/bookings");
  return { ok: true } as const;
}
