import Link from "next/link";
import { Metadata } from "next";
import { getAllPosts } from "@/lib/sanity";
import { Empty } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Blog · Market insights & company news",
  description: "Articles on Nigerian real estate, investment opportunities, and company updates.",
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Insights</h1>
        <p className="mt-3 text-slate-600">Market intelligence, investment notes, and company updates.</p>
      </header>

      {posts.length === 0 ? (
        <Empty title="No posts yet" description="Our editors are preparing the first set of articles." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p._id} href={`/blog/${p.slug}`} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition group-hover:shadow-md">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 bg-gradient-to-br from-teal-100 to-teal-50" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
                  {p.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.excerpt}</p> : null}
                  <div className="mt-auto pt-4 text-xs text-slate-500">{p.author ?? ""}{p.publishedAt ? ` · ${new Date(p.publishedAt).toDateString()}` : ""}</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
