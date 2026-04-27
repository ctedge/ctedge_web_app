import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminBlogPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Blog" description="Articles are authored in Sanity Studio." />
      <Card>
        <CardHeader><CardTitle>Sanity Studio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Create, edit, and publish blog posts inside the embedded Sanity Studio. Posts become visible on the public blog
            immediately after publish (pages revalidate within a minute).
          </p>
          <Link href="/studio" target="_blank"><Button>Open Studio</Button></Link>
        </CardContent>
      </Card>
    </>
  );
}
