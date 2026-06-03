import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { formatNGN, toNumber } from "@/lib/money";
import { addDays, startOfDay, endOfDay } from "date-fns";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const targets = [30, 7];
  const results: Record<string, number> = {};

  for (const days of targets) {
    const target = addDays(new Date(), days);
    const investments = await prisma.investment.findMany({
      where: {
        status: "APPROVED",
        project: { maturityDate: { gte: startOfDay(target), lte: endOfDay(target) } },
      },
      include: { project: true },
    });

    for (const inv of investments) {
      await notify({
        userId: inv.investorId,
        title: `Maturity in ${days} days`,
        body: `${inv.project.title} matures on ${inv.project.maturityDate.toDateString()}. Expected return: ${formatNGN(toNumber(inv.amount) * (1 + inv.project.roiPercent / 100))}.`,
        type: "REMINDER",
        url: `/investor/my-investments/${inv.id}`,
      });
    }
    results[`d${days}`] = investments.length;
  }

  return NextResponse.json({ ok: true, counts: results });
}
