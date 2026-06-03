import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TestimonialForm } from "../_form";

export default async function NewTestimonialPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New testimonial" description="Capture a client or investor quote for the public site." />
      <TestimonialForm />
    </>
  );
}
