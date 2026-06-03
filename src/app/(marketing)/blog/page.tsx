import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { publicUrl } from "@/lib/r2-client";
import { Empty } from "@/components/ui/empty";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Blog · Market insights & company news",
  description: "Articles on Nigerian real estate, investment opportunities, and company updates.",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, coverKey: true, authorName: true, publishedAt: true },
  }).catch(() => []);

  return (
    <>
      <PageHero eyebrow="Blog" title="Insights" description="Market intelligence, investment notes, and company updates." />
      <div className="mx-auto max-w-6xl px-4 py-12">

      {posts.length === 0 ? (
        <Empty title="No posts yet" description="Our editors are preparing the first set of articles." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const coverUrl = p.coverKey ? publicUrl(p.coverKey) : null;
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group">
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition group-hover:shadow-md">
                  {coverUrl ? (
                    <Image src={coverUrl} alt={p.title ?? "Article cover"} width={600} height={176} className="h-44 w-full object-cover" unoptimized />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-teal-100 to-teal-50" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
                    {p.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.excerpt}</p> : null}
                    <div className="mt-auto pt-4 text-xs text-slate-500">
                      {p.authorName ?? ""}{p.publishedAt ? ` · ${new Date(p.publishedAt).toDateString()}` : ""}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
