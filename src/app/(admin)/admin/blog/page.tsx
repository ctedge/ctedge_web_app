import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteBlogPost } from "@/server/actions/blog";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

async function deleteBlogPostAction(formData: FormData) {
  "use server";
  await deleteBlogPost(formData);
}

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireRole("ADMIN");
  const { page: rawPage } = await searchParams;
  const total = await prisma.blogPost.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <PageHeader title="Blog" description="Create and manage blog posts and articles.">
        <Link href="/admin/blog/new"><Button>New post</Button></Link>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Posts ({total})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No posts yet. Create your first post.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Title</TH>
                  <TH>Author</TH>
                  <TH>Category</TH>
                  <TH>Status</TH>
                  <TH>Published</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {posts.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium">{p.title}</TD>
                    <TD>{p.authorName ?? "—"}</TD>
                    <TD>{p.category ?? "—"}</TD>
                    <TD>
                      <Badge variant={p.published ? "success" : "secondary"}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                    </TD>
                    <TD>{p.publishedAt ? p.publishedAt.toDateString() : "—"}</TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/blog/${p.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <form action={deleteBlogPostAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button variant="ghost" size="sm" type="submit">Delete</Button>
                      </form>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            prevHref={buildPageHref("/admin/blog", { page: page - 1 })}
            nextHref={buildPageHref("/admin/blog", { page: page + 1 })}
          />
        </CardContent>
      </Card>
    </>
  );
}
