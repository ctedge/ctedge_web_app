import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { BlogPostForm } from "../_form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit post" description={`Editing: ${post.title}`} />
      <BlogPostForm post={post} />
    </>
  );
}
