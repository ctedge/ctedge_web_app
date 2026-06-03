import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { presignUpload, buildKey, publicUrl } from "@/lib/r2";

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  prefix: z.enum(["proofs", "documents", "listings", "projects", "investments", "kyc", "brochures", "blog"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const allowedAdminOnly: Array<typeof parsed.data.prefix> = ["listings", "projects", "investments", "brochures", "documents", "blog"];
  if (allowedAdminOnly.includes(parsed.data.prefix) && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const key = buildKey(parsed.data.prefix, parsed.data.filename);
  try {
    const url = await presignUpload(key, parsed.data.contentType);
    return NextResponse.json({ url, key, publicUrl: publicUrl(key) });
  } catch (e) {
    console.error("[presign] Failed to generate presigned URL", e);
    return NextResponse.json({ error: "presign_failed" }, { status: 500 });
  }
}
