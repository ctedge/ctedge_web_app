"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  coverKey: z.string().optional(),
  body: z.string().optional(),
  authorName: z.string().optional(),
  category: z.string().optional(),
  published: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

function formatIssue(issue: { path: (string | number)[]; message: string } | undefined, fallback: string) {
  if (!issue) return fallback;
  const field = issue.path.join(".") || "Field";
  return `${field}: ${issue.message}`;
}

export async function upsertBlogPost(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = blogPostSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: formatIssue(parsed.error.issues[0], "Invalid input") } as const;
  const d = parsed.data;

  const published = d.published ?? false;

  const data = {
    title: d.title,
    excerpt: d.excerpt || null,
    coverKey: d.coverKey || null,
    body: d.body || null,
    authorName: d.authorName || null,
    category: d.category || null,
    published,
    seoTitle: d.seoTitle || null,
    seoDesc: d.seoDesc || null,
  };

  let slug = d.slug;

  if (d.id) {
    await prisma.blogPost.update({
      where: { id: d.id },
      data: {
        ...data,
        slug,
        publishedAt: published
          ? (await prisma.blogPost.findUnique({ where: { id: d.id }, select: { publishedAt: true } }))?.publishedAt ?? new Date()
          : null,
      },
    });
  } else {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        publishedAt: published ? new Date() : null,
      },
    });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireRole("ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false } as const;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  if (post) revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
  return { ok: true } as const;
}

