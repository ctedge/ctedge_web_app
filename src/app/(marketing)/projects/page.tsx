import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { publicUrl } from "@/lib/r2-client";
import { Empty } from "@/components/ui/empty";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

const filters = ["ONGOING", "COMPLETED", "UPCOMING"] as const;
type Filter = (typeof filters)[number];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = filters.includes(sp.status as Filter) ? (sp.status as Filter) : undefined;
  const projects = await prisma.project.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHero eyebrow="Portfolio" title="Our projects" description="Ongoing, completed, and upcoming developments across Nigeria." />
      <div className="container-x py-12">
      <div className="flex flex-wrap gap-2">
        <a href="/projects" className={`rounded-full border px-4 py-1.5 text-sm ${!status ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 text-slate-700"}`}>All</a>
        {filters.map((f) => (
          <a key={f} href={`/projects?status=${f}`} className={`rounded-full border px-4 py-1.5 text-sm ${status === f ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 text-slate-700"}`}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="mt-10"><Empty title="No projects yet" description="Projects will appear once added by an admin." /></div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  src={p.galleryKeys[0] ? publicUrl(p.galleryKeys[0]) : "/placeholder-property.svg"}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <Badge className="absolute left-3 top-3" variant={p.status === "COMPLETED" ? "success" : p.status === "ONGOING" ? "warning" : "secondary"}>
                  {p.status}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                {p.location ? <p className="mt-1 text-sm text-slate-500">{p.location}</p> : null}
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
