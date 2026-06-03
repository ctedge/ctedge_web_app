"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/rbac";
import { notifyAdmins, notify } from "@/lib/notifications";
import { renderEmail } from "@/lib/emails/render";
import { InvestmentApprovedEmail } from "@/lib/emails/templates";
import { formatNGN, toNumber } from "@/lib/money";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const investSchema = z.object({
  projectId: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function investInProject(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "INVESTOR" && user.role !== "ADMIN") {
    return { ok: false, message: "Only investors can invest" } as const;
  }

  const parsed = investSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid amount" } as const;

  const project = await prisma.investmentProject.findUnique({ where: { id: parsed.data.projectId } });
  if (!project) return { ok: false, message: "Project not found" } as const;
  if (project.status !== "OPEN") return { ok: false, message: "This project is not accepting investments" } as const;
  if (parsed.data.amount < toNumber(project.minAmount)) {
    return { ok: false, message: `Minimum investment is ${formatNGN(toNumber(project.minAmount))}` } as const;
  }
  const available = toNumber(project.totalTarget) - toNumber(project.totalRaised);
  if (parsed.data.amount > available) {
    return { ok: false, message: `Maximum available is ${formatNGN(available)}` } as const;
  }

  const existing = await prisma.investment.findFirst({
    where: {
      investorId: user.id,
      projectId: project.id,
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, message: "You already have a pending or approved investment in this project." } as const;
  }

  const investment = await prisma.investment.create({
    data: {
      investorId: user.id,
      projectId: project.id,
      amount: parsed.data.amount,
      status: "PENDING",
    },
  });

  await notifyAdmins({
    title: "New investment request",
    body: `${user.name ?? user.email} wants to invest ${formatNGN(parsed.data.amount)} in ${project.title}.`,
    type: "APPROVAL",
    url: "/admin/investments",
  });

  revalidatePath("/investor");
  revalidatePath("/investor/my-investments");
  redirect(`/investor/my-investments/${investment.id}`);
}

const decisionSchema = z.object({
  investmentId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export async function decideInvestment(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const investment = await prisma.investment.findUnique({
    where: { id: parsed.data.investmentId },
    include: { project: true, investor: true },
  });
  if (!investment) return { ok: false, message: "Not found" } as const;

  await prisma.$transaction(async (tx) => {
    await tx.investment.update({
      where: { id: investment.id },
      data: { status: parsed.data.decision },
    });

    if (parsed.data.decision === "APPROVED") {
      await tx.investmentProject.update({
        where: { id: investment.projectId },
        data: { totalRaised: { increment: investment.amount } },
      });
    }
  });

  if (parsed.data.decision === "APPROVED") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { html, text } = await renderEmail(
      InvestmentApprovedEmail({
        projectTitle: investment.project.title,
        amount: formatNGN(toNumber(investment.amount)),
        dashboardUrl: `${siteUrl}/investor/my-investments/${investment.id}`,
      })
    );
    await notify({
      userId: investment.investorId,
      title: "Investment approved",
      body: `Your ${formatNGN(toNumber(investment.amount))} investment in ${investment.project.title} has been approved.`,
      type: "APPROVAL",
      url: `/investor/my-investments/${investment.id}`,
      email: { subject: `Investment approved · ${investment.project.title}`, html, text },
    });
  } else {
    await notify({
      userId: investment.investorId,
      title: "Investment not approved",
      body: `Your investment in ${investment.project.title} was not approved. Please contact support for details.`,
      type: "APPROVAL",
      url: `/investor/my-investments/${investment.id}`,
    });
  }

  revalidatePath("/admin/investments");
  revalidatePath("/investor");
  revalidatePath(`/investor/my-investments/${investment.id}`);
  return { ok: true } as const;
}

const disbursementSchema = z.object({
  investmentId: z.string().min(1),
  amount: z.coerce.number().positive(),
  note: z.string().max(300).optional(),
});

export async function recordDisbursement(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = disbursementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const investment = await prisma.investment.findUnique({ where: { id: parsed.data.investmentId } });
  if (!investment) return { ok: false, message: "Investment not found" } as const;

  await prisma.disbursement.create({
    data: {
      investmentId: investment.id,
      amount: parsed.data.amount,
      paidAt: new Date(),
      note: parsed.data.note,
    },
  });

  await notify({
    userId: investment.investorId,
    title: "Payout received",
    body: `A disbursement of ${formatNGN(parsed.data.amount)} has been recorded against your investment.`,
    type: "PAYMENT",
    url: `/investor/my-investments/${investment.id}`,
  });

  revalidatePath(`/investor/my-investments/${investment.id}`);
  revalidatePath("/admin/investments");
  return { ok: true } as const;
}

const agreementSchema = z.object({
  investmentId: z.string().min(1),
  agreementKey: z.string().min(1),
});

export async function attachInvestmentAgreement(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = agreementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid input" } as const;

  const investment = await prisma.investment.update({
    where: { id: parsed.data.investmentId },
    data: { agreementKey: parsed.data.agreementKey },
    include: { project: true },
  });

  await prisma.document.create({
    data: {
      ownerUserId: investment.investorId,
      kind: "AGREEMENT",
      title: `Agreement · ${investment.project.title}`,
      r2Key: parsed.data.agreementKey,
    },
  });

  await notify({
    userId: investment.investorId,
    title: "Agreement available",
    body: `Your agreement for ${investment.project.title} is ready to download.`,
    type: "INFO",
    url: `/investor/my-investments/${investment.id}`,
  });

  revalidatePath(`/investor/my-investments/${investment.id}`);
  return { ok: true } as const;
}
