"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useRef, useState } from "react";
import { publicUrl } from "@/lib/r2-client";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl my-4 mx-auto" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] w-full rounded-b-md border-x border-b border-slate-300 bg-white p-4 text-sm focus:outline-none prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-teal-700 prose-img:rounded-xl [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:h-auto [&_iframe]:rounded-xl",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  async function handleImageUpload(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          prefix: "blog",
        }),
      });
      if (!res.ok) throw new Error("Presign failed");
      const { url, key } = (await res.json()) as { url: string; key: string };
      const put = await fetch(url, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");
      editor.chain().focus().setImage({ src: publicUrl(key), alt: file.name }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function promptLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function promptYoutube() {
    if (!editor) return;
    const url = window.prompt("YouTube URL", "https://www.youtube.com/watch?v=");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  function insertSpacer() {
    editor?.chain().focus().insertContent("<p><br></p>").run();
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-300">
      <div className="flex flex-wrap gap-1 border-b border-slate-300 bg-slate-50 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor?.chain().focus().setParagraph().run()}
          active={editor?.isActive("paragraph") ?? false}
          title="Paragraph"
        >
          ¶
        </ToolbarButton>
        {[1, 2, 3, 4, 5].map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 }).run()}
            active={editor?.isActive("heading", { level }) ?? false}
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold") ?? false}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic") ?? false}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList") ?? false}
          title="Bullet list"
        >
          •—
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList") ?? false}
          title="Ordered list"
        >
          1—
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote") ?? false}
          title="Blockquote"
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Horizontal rule"
        >
          —
        </ToolbarButton>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <ToolbarButton onClick={promptLink} active={editor?.isActive("link") ?? false} title="Link">
          🔗
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          active={false}
          title="Insert image"
        >
          {uploading ? "…" : "🖼"}
        </ToolbarButton>
        <ToolbarButton onClick={promptYoutube} active={false} title="Embed YouTube video">
          ▶
        </ToolbarButton>
        <ToolbarButton onClick={insertSpacer} active={false} title="Insert blank line">
          ␣
        </ToolbarButton>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} active={false} title="Undo">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} active={false} title="Redo">
          ↪
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
      </div>
      {!editor && placeholder ? (
        <div className="min-h-[320px] w-full p-4 text-sm text-slate-400">{placeholder}</div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-medium transition ${
        active ? "bg-[#011F54] text-white" : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// Reference Editor type to keep the import used by editor instances.
export type RichTextEditorInstance = Editor;
