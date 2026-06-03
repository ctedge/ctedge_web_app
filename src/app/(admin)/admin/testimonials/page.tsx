import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTestimonial } from "@/server/actions/testimonials";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

async function deleteTestimonialAction(formData: FormData) {
  "use server";
  await deleteTestimonial(formData);
}

export default async function AdminTestimonialsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireRole("ADMIN");
  const { page: rawPage } = await searchParams;
  const total = await prisma.testimonial.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const items = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <PageHeader title="Testimonials" description="Voices of clients and investors shown on the home and about pages.">
        <Link href="/admin/testimonials/new"><Button>New testimonial</Button></Link>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>Testimonials ({total})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No testimonials yet. Create your first one.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Author</TH>
                  <TH>Role</TH>
                  <TH>Quote</TH>
                  <TH>Order</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((t) => (
                  <TR key={t.id}>
                    <TD className="font-medium">
                      {t.authorName}
                      {t.company || t.location ? (
                        <div className="text-xs font-normal text-slate-500">
                          {[t.company, t.location].filter(Boolean).join(" · ")}
                        </div>
                      ) : null}
                    </TD>
                    <TD>
                      <Badge variant={t.role === "INVESTOR" ? "success" : "secondary"}>
                        {t.role === "INVESTOR" ? "Investor" : "Client"}
                      </Badge>
                    </TD>
                    <TD className="max-w-md truncate text-slate-600">{t.quote}</TD>
                    <TD>{t.sortOrder}</TD>
                    <TD>
                      <Badge variant={t.published ? "success" : "secondary"}>
                        {t.published ? "Visible" : "Hidden"}
                      </Badge>
                    </TD>
                    <TD className="flex items-center justify-end gap-2">
                      <Link href={`/admin/testimonials/${t.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <form action={deleteTestimonialAction}>
                        <input type="hidden" name="id" value={t.id} />
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
            prevHref={buildPageHref("/admin/testimonials", { page: page - 1 })}
            nextHref={buildPageHref("/admin/testimonials", { page: page + 1 })}
          />
        </CardContent>
      </Card>
    </>
  );
}
