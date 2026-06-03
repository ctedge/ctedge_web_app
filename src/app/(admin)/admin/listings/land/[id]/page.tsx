import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { LandListingForm } from "../_land-form";

export const dynamic = "force-dynamic";

export default async function EditLandPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;

  if (id === "new") {
    return (
      <>
        <PageHeader title="New land listing" description="Publish a new parcel for sale." />
        <LandListingForm />
      </>
    );
  }

  const listing = await prisma.landListing.findUnique({ where: { id } });
  if (!listing) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${listing.title}`} description="Update details and publish changes." />
      <LandListingForm listing={{
        ...listing,
        priceOutright: listing.priceOutright?.toNumber() ?? null,
        priceInstallment: listing.priceInstallment?.toNumber() ?? null,
      }} />
    </>
  );
}
