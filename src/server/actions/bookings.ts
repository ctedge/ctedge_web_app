"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { renderEmail } from "@/lib/emails/render";
import { InspectionNoticeEmail } from "@/lib/emails/templates";

const schema = z.object({
  listingType: z.enum(["LAND", "HOUSING"]),
  listingId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  preferredDate: z.string().min(1).refine((value) => !Number.isNaN(new Date(value).valueOf()), {
    message: "Invalid date",
  }),
  note: z.string().max(1000).optional(),
});

export type InspectionFormState = { ok: boolean; message?: string; errors?: Record<string, string[]> };

export async function bookInspection(_prev: InspectionFormState, formData: FormData): Promise<InspectionFormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;

  let listingTitle = "Listing";
  if (d.listingType === "LAND") {
    const l = await prisma.landListing.findUnique({ where: { id: d.listingId } });
    listingTitle = l?.title ?? listingTitle;
  } else {
    const h = await prisma.housingListing.findUnique({ where: { id: d.listingId } });
    listingTitle = h?.title ?? listingTitle;
  }

  const booking = await prisma.inspectionBooking.create({
    data: {
      listingType: d.listingType,
      landId: d.listingType === "LAND" ? d.listingId : null,
      housingId: d.listingType === "HOUSING" ? d.listingId : null,
      name: d.name,
      phone: d.phone,
      email: d.email,
      preferredDate: new Date(d.preferredDate),
      note: d.note,
    },
  });

  const adminEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL;
  if (adminEmail) {
    const { html, text } = await renderEmail(
      InspectionNoticeEmail({
        booking: {
          name: booking.name,
          phone: booking.phone,
          preferredDate: booking.preferredDate.toDateString(),
          listingTitle,
        },
      })
    );
    try {
      await sendMail({ to: adminEmail, subject: `Inspection booking: ${listingTitle}`, html, text });
    } catch (err) {
      console.error("[bookings] email failed:", err);
    }
  }

  return { ok: true, message: "Inspection booked — we&apos;ll confirm shortly." };
}
