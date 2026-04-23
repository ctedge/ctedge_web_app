"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/rbac";
import { notifyAdmins, notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

const uploadSchema = z.object({
  docKey: z.string().min(1),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccName: z.string().optional(),
});

export async function submitInvestorKyc(formData: FormData) {
  const user = await requireUser();
  const parsed = uploadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const profile = await prisma.investorProfile.findUnique({ where: { userId: user.id } });
  const existingKeys = profile?.kycDocKeys ?? [];

  await prisma.investorProfile.upsert({
    where: { userId: user.id },
    update: {
      kycStatus: "PENDING",
      kycDocKeys: [...existingKeys, parsed.data.docKey],
      bankName: parsed.data.bankName ?? profile?.bankName,
      bankAccount: parsed.data.bankAccount ?? profile?.bankAccount,
      bankAccName: parsed.data.bankAccName ?? profile?.bankAccName,
    },
    create: {
      userId: user.id,
      kycStatus: "PENDING",
      kycDocKeys: [parsed.data.docKey],
      bankName: parsed.data.bankName,
      bankAccount: parsed.data.bankAccount,
      bankAccName: parsed.data.bankAccName,
    },
  });

  await notifyAdmins({
    title: "KYC documents submitted",
    body: `${user.name ?? user.email} submitted KYC for review.`,
    type: "APPROVAL",
    url: "/admin/investors",
  });

  revalidatePath("/investor/kyc");
  return { ok: true } as const;
}

const decideSchema = z.object({
  userId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export async function decideKyc(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = decideSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  await prisma.investorProfile.update({
    where: { userId: parsed.data.userId },
    data: { kycStatus: parsed.data.decision },
  });

  await notify({
    userId: parsed.data.userId,
    title: parsed.data.decision === "APPROVED" ? "KYC approved" : "KYC not approved",
    body: parsed.data.decision === "APPROVED"
      ? "Your identity documents were verified. You can now invest without restrictions."
      : "We were unable to verify your documents. Please contact support.",
    type: "APPROVAL",
    url: "/investor/kyc",
  });

  revalidatePath("/admin/investors");
  revalidatePath("/investor/kyc");
  return { ok: true } as const;
}
