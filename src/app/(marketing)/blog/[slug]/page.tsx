import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getPostBySlug, getAllPosts } from "@/lib/sanity";
import { urlForImage } from "@/lib/sanity-image";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
    },
  };
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value)?.width(1200).url();
      if (!url) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt="" className="my-6 rounded-lg" />;
    },
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publishedAt,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="text-xs font-semibold uppercase tracking-wider text-teal-700 hover:underline">← All articles</Link>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">{post.title}</h1>
      <div className="mt-3 text-sm text-slate-500">{post.author ?? ""}{post.publishedAt ? ` · ${new Date(post.publishedAt).toDateString()}` : ""}</div>
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverUrl} alt="" className="mt-6 rounded-xl" />
      ) : null}
      <div className="prose prose-slate mt-8 max-w-none">
        <PortableText value={post.body as never} components={components} />
      </div>
    </article>
  );
}
