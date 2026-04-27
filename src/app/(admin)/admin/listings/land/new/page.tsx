import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { LandListingForm } from "../_land-form";

export default async function NewLandListingPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New land listing" description="Publish a new parcel for sale." />
      <LandListingForm />
    </>
  );
}
