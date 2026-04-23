import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { HousingListingForm } from "../_housing-form";

export default async function NewHousingPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New housing listing" description="Publish a new home for sale." />
      <HousingListingForm />
    </>
  );
}
