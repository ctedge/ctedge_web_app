import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TestimonialForm } from "../_form";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <>
      <PageHeader title="Edit testimonial" description={`Editing: ${testimonial.authorName}`} />
      <TestimonialForm testimonial={testimonial} />
    </>
  );
}
