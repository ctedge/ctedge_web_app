"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { renderEmail } from "@/lib/emails/render";
import { LeadNoticeEmail } from "@/lib/emails/templates";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  phone: z.string().min(7, "Phone is required").max(30),
  email: z.string().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  interest: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  note: z.string().max(2000).optional(),
});

export type LeadFormState = { ok: boolean; message?: string; errors?: Record<string, string[]> };

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const data = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return { ok: false, message: "Please fix the highlighted fields.", errors: flat.fieldErrors };
  }
  const lead = await prisma.lead.create({ data: parsed.data });

  const adminEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL;
  if (adminEmail) {
    const { html, text } = await renderEmail(
      LeadNoticeEmail({
        lead: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email ?? undefined,
          interest: lead.interest ?? undefined,
          source: lead.source ?? undefined,
          note: lead.note ?? undefined,
        },
      })
    );
    try {
      await sendMail({ to: adminEmail, subject: `New lead: ${lead.name}`, html, text });
    } catch (err) {
      console.error("[leads] failed to email admin:", err);
    }
  }
  return { ok: true, message: "Thanks — we&apos;ll reach out shortly." };
}
