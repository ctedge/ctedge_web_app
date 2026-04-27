import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const result = await prisma.installment.updateMany({
    where: { status: { in: ["PENDING", "DUE"] }, dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  return NextResponse.json({ ok: true, marked: result.count });
}
