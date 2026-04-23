import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { signedGetUrl } from "@/lib/r2";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payment: true, purchase: true, investment: true },
  });
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!invoice.payment?.receiptKey) return NextResponse.json({ error: "no_receipt" }, { status: 404 });

  const ownerId = invoice.purchase?.customerId ?? invoice.investment?.investorId;
  if (ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = await signedGetUrl(invoice.payment.receiptKey);
  return NextResponse.redirect(url);
}
