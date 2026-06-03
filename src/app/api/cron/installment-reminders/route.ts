import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { renderEmail } from "@/lib/emails/render";
import { ReminderEmail } from "@/lib/emails/templates";
import { formatNGN, toNumber } from "@/lib/money";
import { addDays, startOfDay, endOfDay } from "date-fns";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const targets = [7, 3, 1];
  const results: Record<string, number> = {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  for (const days of targets) {
    const target = addDays(new Date(), days);
    const installments = await prisma.installment.findMany({
      where: {
        status: { in: ["PENDING", "DUE"] },
        dueDate: { gte: startOfDay(target), lte: endOfDay(target) },
      },
      include: { purchase: { include: { customer: true } } },
    });

    for (const inst of installments) {
      const customer = inst.purchase.customer;
      const amount = formatNGN(toNumber(inst.amount));
      const title = `Installment due in ${days} day${days > 1 ? "s" : ""}`;
      const body = `Hi ${customer.name ?? customer.email ?? "there"}, an installment of ${amount} is due on ${inst.dueDate.toDateString()}.`;
      const { html, text } = await renderEmail(
        ReminderEmail({
          title,
          body,
          ctaUrl: `${siteUrl}/dashboard/properties/${inst.purchaseId}`,
        })
      );
      await notify({
        userId: customer.id,
        title: `Installment due in ${days} day${days > 1 ? "s" : ""}`,
        body: `An installment of ${amount} is due on ${inst.dueDate.toDateString()}.`,
        type: "REMINDER",
        url: `/dashboard/properties/${inst.purchaseId}`,
        email: { subject: `Payment reminder · ${amount}`, html, text },
      });
    }

    if (days === 1) {
      await prisma.installment.updateMany({
        where: { id: { in: installments.map((i) => i.id) }, status: "PENDING" },
        data: { status: "DUE" },
      });
    }

    results[`d${days}`] = installments.length;
  }

  return NextResponse.json({ ok: true, counts: results });
}
