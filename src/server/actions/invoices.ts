"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/rbac";
import { notifyAdmins, notify } from "@/lib/notifications";
import { generateInvoiceNumber } from "@/lib/utils";
import { renderEmail } from "@/lib/emails/render";
import { InvoiceEmail, ReceiptEmail } from "@/lib/emails/templates";
import { sendMail } from "@/lib/mailer";
import { formatNGN, toNumber } from "@/lib/money";
import { generateReceiptPdf } from "@/lib/pdf/receipt";
import { putObject, buildKey, publicUrl } from "@/lib/r2";
import { revalidatePath } from "next/cache";

const attachProofSchema = z.object({
  invoiceId: z.string().min(1),
  proofKey: z.string().min(1),
});

const userTicketSchema = z.object({
  amount: z.coerce.number().positive(),
  notes: z.string().max(500).optional(),
});

export async function createPurchasePaymentTicket(formData: FormData) {
  const user = await requireUser();
  const purchaseId = String(formData.get("purchaseId") ?? "");
  if (!purchaseId) return { ok: false, message: "Missing purchase" } as const;
  const parsed = userTicketSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" } as const;

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) return { ok: false, message: "Purchase not found" } as const;
  if (purchase.customerId !== user.id && user.role !== "ADMIN") {
    return { ok: false, message: "Forbidden" } as const;
  }

  const invoice = await prisma.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      target: "PURCHASE",
      purchaseId: purchase.id,
      amount: parsed.data.amount,
      notes: parsed.data.notes,
    },
  });

  await notifyAdmins({
    title: "New payment ticket",
    body: `${user.name ?? user.email} opened a payment ticket for ${formatNGN(parsed.data.amount)}.`,
    type: "PAYMENT",
    url: "/admin/invoices",
  });

  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/properties/${purchase.id}`);
  return { ok: true, id: invoice.id } as const;
}

export async function createInvestmentPaymentTicket(formData: FormData) {
  const user = await requireUser();
  const investmentId = String(formData.get("investmentId") ?? "");
  if (!investmentId) return { ok: false, message: "Missing investment" } as const;
  const parsed = userTicketSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" } as const;

  const investment = await prisma.investment.findUnique({ where: { id: investmentId } });
  if (!investment) return { ok: false, message: "Investment not found" } as const;
  if (investment.investorId !== user.id && user.role !== "ADMIN") {
    return { ok: false, message: "Forbidden" } as const;
  }

  const invoice = await prisma.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      target: "INVESTMENT",
      investmentId: investment.id,
      amount: parsed.data.amount,
      notes: parsed.data.notes,
    },
  });

  await notifyAdmins({
    title: "New payment ticket",
    body: `${user.name ?? user.email} opened a payment ticket for ${formatNGN(parsed.data.amount)}.`,
    type: "PAYMENT",
    url: "/admin/invoices",
  });

  revalidatePath("/dashboard/payments");
  revalidatePath(`/investor/my-investments/${investment.id}`);
  return { ok: true, id: invoice.id } as const;
}

export async function attachProof(formData: FormData) {
  const user = await requireUser();
  const parsed = attachProofSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: { purchase: true, investment: true },
  });
  if (!invoice) return { ok: false, message: "Invoice not found" } as const;

  const ownerId = invoice.purchase?.customerId ?? invoice.investment?.investorId;
  if (ownerId !== user.id && user.role !== "ADMIN") return { ok: false, message: "Forbidden" } as const;

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { proofKey: parsed.data.proofKey, status: "AWAITING_REVIEW" },
  });

  await notifyAdmins({
    title: "Payment proof uploaded",
    body: `${user.name ?? user.email} uploaded proof for invoice ${invoice.number}.`,
    type: "PAYMENT",
    url: `/admin/invoices`,
  });

  revalidatePath(`/dashboard/properties`);
  revalidatePath(`/dashboard/payments`);
  revalidatePath(`/investor/my-investments`);
  return { ok: true } as const;
}

const createInvoiceSchema = z.object({
  target: z.enum(["PURCHASE", "INVESTMENT"]),
  purchaseId: z.string().optional(),
  investmentId: z.string().optional(),
  amount: z.coerce.number().positive(),
  dueAt: z.string().optional().refine((value) => !value || !Number.isNaN(new Date(value).valueOf()), {
    message: "Invalid due date",
  }),
  notes: z.string().max(500).optional(),
});

export async function createInvoice(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = createInvoiceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid invoice input" } as const;
  const d = parsed.data;
  if (d.target === "PURCHASE" && !d.purchaseId) return { ok: false, message: "Missing purchase" } as const;
  if (d.target === "INVESTMENT" && !d.investmentId) return { ok: false, message: "Missing investment" } as const;

  const invoice = await prisma.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      target: d.target,
      purchaseId: d.target === "PURCHASE" ? d.purchaseId : null,
      investmentId: d.target === "INVESTMENT" ? d.investmentId : null,
      amount: d.amount,
      dueAt: d.dueAt ? new Date(d.dueAt) : null,
      notes: d.notes,
    },
    include: { purchase: true, investment: true },
  });

  const ownerId = invoice.purchase?.customerId ?? invoice.investment?.investorId;
  if (ownerId) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const path = d.target === "PURCHASE" ? `/dashboard/properties/${d.purchaseId}` : `/investor/my-investments/${d.investmentId}`;
    const { html, text } = await renderEmail(
      InvoiceEmail({
        invoiceNumber: invoice.number,
        amount: formatNGN(d.amount),
        dueAt: d.dueAt ? new Date(d.dueAt).toDateString() : undefined,
        invoiceUrl: `${siteUrl}${path}`,
      })
    );
    await notify({
      userId: ownerId,
      title: `Invoice ${invoice.number} issued`,
      body: `An invoice for ${formatNGN(d.amount)} has been issued.`,
      type: "PAYMENT",
      url: path,
      email: { subject: `Invoice ${invoice.number}`, html, text },
    });
  }

  revalidatePath("/admin/invoices");
  return { ok: true, id: invoice.id } as const;
}

const markPaidSchema = z.object({ invoiceId: z.string().min(1) });

export async function markInvoicePaid(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const parsed = markPaidSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: { purchase: { include: { installments: { orderBy: { dueDate: "asc" } } } }, investment: true },
  });
  if (!invoice) return { ok: false, message: "Invoice not found" } as const;
  if (invoice.status === "PAID") return { ok: false, message: "Already paid" } as const;

  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";
  const receiptKey = buildKey("receipts", `${invoice.number}.pdf`);

  try {
    const pdf = await generateReceiptPdf({
      receiptNumber: `RCPT-${invoice.number}`,
      amount: toNumber(invoice.amount),
      payerName: "",
      issuedAt: new Date(),
      invoiceNumber: invoice.number,
      companyName: company,
    });
    await putObject(receiptKey, pdf, "application/pdf");
  } catch {
    return { ok: false, message: "Failed to generate receipt. Please try again." } as const;
  }

  let payment: { id: string };
  let ownerId: string | null | undefined;

  try {
    ({ payment, ownerId } = await prisma.$transaction(async (tx) => {
      const current = await tx.invoice.findUnique({ where: { id: invoice.id }, select: { status: true } });
      if (current?.status === "PAID") throw new Error("already_paid");

      const p = await tx.payment.create({
        data: { invoiceId: invoice.id, amount: invoice.amount, recordedById: admin.id, receiptKey },
      });
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });

      if (invoice.purchase) {
        const next = invoice.purchase.installments.find((i) => i.status !== "PAID");
        if (next) {
          await tx.installment.update({ where: { id: next.id }, data: { status: "PAID", paidAt: new Date() } });
        }
      }

      const owner = invoice.purchase?.customerId ?? invoice.investment?.investorId;
      if (owner) {
        await tx.document.create({
          data: { ownerUserId: owner, kind: "RECEIPT", title: `Receipt for ${invoice.number}`, r2Key: receiptKey },
        });
      }

      return { payment: p, ownerId: owner };
    }, { isolationLevel: "Serializable" }));
  } catch (e) {
    if (e instanceof Error && e.message === "already_paid") {
      return { ok: false, message: "Already paid" } as const;
    }
    throw e;
  }

  if (ownerId) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { html, text } = await renderEmail(
      ReceiptEmail({
        receiptNumber: `RCPT-${invoice.number}`,
        amount: formatNGN(toNumber(invoice.amount)),
        receiptUrl: `${siteUrl}/api/receipts/${invoice.id}`,
      })
    );
    await notify({
      userId: ownerId,
      title: "Payment received",
      body: `We confirmed your payment of ${formatNGN(toNumber(invoice.amount))}.`,
      type: "PAYMENT",
      url: `/dashboard/payments`,
      email: { subject: "Payment received", html, text },
    });
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard/payments");
  revalidatePath("/investor/my-investments");
  return { ok: true, paymentId: payment.id, receiptKey: publicUrl(receiptKey) } as const;
}
