import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { HousingListingForm } from "../_housing-form";

export const dynamic = "force-dynamic";

export default async function EditHousingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const listing = await prisma.housingListing.findUnique({ where: { id } });
  if (!listing) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${listing.title}`} description="Update details and publish changes." />
      <HousingListingForm listing={{ ...listing, price: listing.price.toNumber() }} />
    </>
  );
}
