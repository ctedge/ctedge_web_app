import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { BlogPostForm } from "../_form";

export default async function NewBlogPostPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="New post" description="Write and publish a new blog article." />
      <BlogPostForm />
    </>
  );
}
