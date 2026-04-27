import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { signedGetUrl } from "@/lib/r2";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });

  if (session.user.role !== "ADMIN") {
    const doc = await prisma.document.findFirst({ where: { r2Key: key, ownerUserId: session.user.id } });
    if (!doc) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = await signedGetUrl(key);
  return NextResponse.redirect(url);
}
