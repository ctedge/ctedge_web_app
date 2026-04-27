import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";

function csv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const type = new URL(req.url).searchParams.get("type") ?? "payments";

  let body = "";
  let filename = "report.csv";

  if (type === "payments") {
    const rows = await prisma.payment.findMany({ include: { invoice: true, recordedBy: true }, orderBy: { paidAt: "desc" } });
    body = csv(rows.map((p) => ({
      paidAt: p.paidAt.toISOString(),
      invoice: p.invoice.number,
      amount: toNumber(p.amount),
      target: p.invoice.target,
      recordedBy: p.recordedBy.email ?? "",
    })));
    filename = "payments.csv";
  } else if (type === "investments") {
    const rows = await prisma.investment.findMany({ include: { investor: true, project: true }, orderBy: { investedAt: "desc" } });
    body = csv(rows.map((i) => ({
      investedAt: i.investedAt.toISOString(),
      investor: i.investor.email ?? "",
      project: i.project.title,
      amount: toNumber(i.amount),
      status: i.status,
    })));
    filename = "investments.csv";
  } else if (type === "sales") {
    const rows = await prisma.purchase.findMany({ include: { customer: true }, orderBy: { startedAt: "desc" } });
    body = csv(rows.map((p) => ({
      startedAt: p.startedAt.toISOString(),
      customer: p.customer.email ?? "",
      listingType: p.listingType,
      totalPrice: toNumber(p.totalPrice),
      paymentMode: p.paymentMode,
    })));
    filename = "sales.csv";
  } else {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
