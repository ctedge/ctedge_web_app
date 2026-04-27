import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const sanity = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-10-01",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
      perspective: "published",
    })
  : null;

export type SanityPostPreview = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  coverUrl?: string;
  author?: string;
};

export type SanityPost = SanityPostPreview & {
  body: unknown;
  seoTitle?: string;
  seoDescription?: string;
};

const postPreviewFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "coverUrl": coverImage.asset->url,
  "author": author->name
`;

export async function getRecentPosts(limit = 6): Promise<SanityPostPreview[]> {
  if (!sanity) return [];
  return sanity.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit]{${postPreviewFields}}`,
    { limit },
    { next: { revalidate: 60 } }
  );
}

export async function getAllPosts(): Promise<SanityPostPreview[]> {
  if (!sanity) return [];
  return sanity.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){${postPreviewFields}}`,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  if (!sanity) return null;
  return sanity.fetch(
    `*[_type == "post" && slug.current == $slug][0]{${postPreviewFields}, body, seoTitle, seoDescription}`,
    { slug },
    { next: { revalidate: 60 } }
  );
}
