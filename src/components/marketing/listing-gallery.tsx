"use client";

import Image from "next/image";
import { useState } from "react";
import { publicUrl } from "@/lib/r2-client";

export function ListingGallery({ imageKeys, title }: { imageKeys: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const images = imageKeys.length > 0 ? imageKeys : ["__placeholder__"];
  const src = (k: string) => (k === "__placeholder__" ? "/placeholder-property.svg" : publicUrl(k));

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100"
      >
        <Image src={src(images[index])} alt={title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
      </button>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 ${i === index ? "border-teal-600" : "border-transparent"}`}
            >
              <Image src={src(k)} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-h-[90vh] max-w-5xl">
            <Image src={src(images[index])} alt={title} width={1600} height={1000} className="max-h-[90vh] w-auto rounded-lg object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
