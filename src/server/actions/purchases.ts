"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { notifyAdmins } from "@/lib/notifications";
import type { ListingType, PaymentMode } from "@prisma/client";

const reserveSchema = z.object({
  listingType: z.enum(["LAND", "HOUSING"]),
  listingId: z.string().min(1),
  paymentMode: z.enum(["OUTRIGHT", "INSTALLMENT"]).default("OUTRIGHT"),
});

export async function reserveListing(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") redirect("/login");
  const parsed = reserveSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Invalid reservation." } as const;

  let totalPrice = 0;
  let title = "";
  if (parsed.data.listingType === "LAND") {
    const l = await prisma.landListing.findUnique({ where: { id: parsed.data.listingId } });
    if (!l) return { ok: false, message: "Listing not found." } as const;
    totalPrice = Number(
      (parsed.data.paymentMode === "INSTALLMENT" ? l.priceInstallment : l.priceOutright) ?? l.priceOutright ?? l.priceInstallment ?? 0
    );
    title = l.title;
  } else {
    const h = await prisma.housingListing.findUnique({ where: { id: parsed.data.listingId } });
    if (!h) return { ok: false, message: "Listing not found." } as const;
    totalPrice = Number(h.price);
    title = h.title;
  }

  const purchase = await prisma.purchase.create({
    data: {
      customerId: user.id,
      listingType: parsed.data.listingType as ListingType,
      listingId: parsed.data.listingId,
      totalPrice,
      paymentMode: parsed.data.paymentMode as PaymentMode,
    },
  });

  await notifyAdmins({
    title: "New reservation",
    body: `${user.name ?? user.email} reserved ${title}.`,
    type: "INFO",
    url: `/admin/customers`,
  });

  redirect(`/dashboard/properties/${purchase.id}`);
}
