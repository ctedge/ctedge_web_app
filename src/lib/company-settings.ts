import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const getCompanySettings = cache(async () => {
  const row = await prisma.companySettings.findUnique({ where: { id: "default" } }).catch(() => null);
  return {
    name:     row?.name     || process.env.NEXT_PUBLIC_COMPANY_NAME     || "CT Edge",
    address:  row?.address  || process.env.NEXT_PUBLIC_COMPANY_ADDRESS  || "Lagos, Nigeria",
    phone:    row?.phone    || process.env.NEXT_PUBLIC_COMPANY_PHONE    || "+234 800 000 0000",
    email:    row?.email    || process.env.NEXT_PUBLIC_COMPANY_EMAIL    || "hello@example.com",
    whatsapp: row?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER  || "2348000000000",
  };
});

export type CompanySettings = Awaited<ReturnType<typeof getCompanySettings>>;
