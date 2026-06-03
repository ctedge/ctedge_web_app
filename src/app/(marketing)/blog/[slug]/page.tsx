import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { publicUrl } from "@/lib/r2-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } }).catch(() => null);
  if (!post) return {};
  const coverUrl = post.coverKey ? publicUrl(post.coverKey) : undefined;
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDesc ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDesc ?? post.excerpt ?? undefined,
      images: coverUrl ? [coverUrl] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } }).catch(() => null);
  if (!post) notFound();

  const coverUrl = post.coverKey ? publicUrl(post.coverKey) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: coverUrl ? [coverUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    author: post.authorName ? { "@type": "Person", name: post.authorName } : undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="text-xs font-semibold uppercase tracking-wider text-teal-700 hover:underline">← All articles</Link>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">{post.title}</h1>
      <div className="mt-3 text-sm text-slate-500">
        {post.authorName ?? ""}{post.publishedAt ? ` · ${new Date(post.publishedAt).toDateString()}` : ""}
      </div>
      {coverUrl ? (
        <Image src={coverUrl} alt={post.title ?? "Article cover"} width={900} height={500} className="mt-6 rounded-xl w-full object-cover" unoptimized />
      ) : null}
      <div
        className="prose prose-slate mt-8 max-w-none prose-headings:text-slate-900 prose-a:text-teal-700 prose-img:rounded-xl [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:h-auto [&_iframe]:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.body ?? "" }}
      />
    </article>
  );
}
