import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAllPosts } from "@/lib/sanity";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/land",
    "/housing",
    "/projects",
    "/investments",
    "/blog",
    "/contact",
    "/buy-land",
    "/invest",
    "/construction",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const [land, housing, iproj, proj, posts] = await Promise.all([
    prisma.landListing.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.housingListing.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.investmentProject.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.project.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []),
    getAllPosts().catch(() => []),
  ]);

  return [
    ...staticRoutes,
    ...land.map((l) => ({ url: `${base}/land/${l.slug}`, lastModified: l.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...housing.map((h) => ({ url: `${base}/housing/${h.slug}`, lastModified: h.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...iproj.map((p) => ({ url: `${base}/investments/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...proj.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.publishedAt ? new Date(p.publishedAt) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
