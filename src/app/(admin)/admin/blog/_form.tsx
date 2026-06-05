"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaUploader } from "@/components/admin/media-uploader";
import { upsertBlogPost } from "@/server/actions/blog";

type PostData = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  coverKey?: string | null;
  body?: string | null;
  authorName?: string | null;
  category?: string | null;
  published?: boolean;
  seoTitle?: string | null;
  seoDesc?: string | null;
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostForm({ post }: { post?: PostData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post?.id);
  const [body, setBody] = useState(post?.body ?? "");
  const [coverKeys, setCoverKeys] = useState<string[]>(post?.coverKey ? [post.coverKey] : []);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(toSlug(title));
    }
  }, [title, slugTouched]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);
    formData.set("body", body);
    formData.set("coverKey", coverKeys[0] ?? "");
    start(async () => {
      const result = await upsertBlogPost(formData);
      if (result && !result.ok) {
        toast.error(result.message ?? "Could not save");
        return;
      }
      toast.success("Post saved.");
      router.push("/admin/blog");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-700">Post details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="Slug">
            <Input
              name="slug"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            />
          </Field>
          <Field label="Author name">
            <Input name="authorName" defaultValue={post?.authorName ?? ""} />
          </Field>
          <Field label="Category">
            <Input name="category" defaultValue={post?.category ?? ""} placeholder="e.g. Real Estate, Investment" />
          </Field>
        </div>

        <Field label="Excerpt">
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm"
            placeholder="Short summary shown on the blog listing page"
          />
        </Field>

        <Field label="Cover image">
          <MediaUploader
            prefix="listings"
            value={coverKeys}
            onChange={setCoverKeys}
            accept="image/*"
            multiple={false}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Content</h2>
        <RichTextEditor value={body} onChange={setBody} placeholder="Start writing your article…" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SEO title">
            <Input name="seoTitle" defaultValue={post?.seoTitle ?? ""} placeholder="Overrides post title in search results" />
          </Field>
          <div />
        </div>
        <Field label="SEO description">
          <textarea
            name="seoDesc"
            rows={2}
            defaultValue={post?.seoDesc ?? ""}
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm"
            placeholder="Short description for search engines (150–160 chars)"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="published" defaultChecked={post?.published ?? false} className="h-4 w-4 rounded border-slate-300 accent-teal-600" />
          <span className="text-sm font-medium text-slate-700">Publish this post</span>
        </label>
        <p className="mt-1 ml-7 text-xs text-slate-500">Published posts are visible on the public blog. Drafts are hidden.</p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/blog")}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : post?.id ? "Update post" : "Create post"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
