import Link from "next/link";
import Image from "next/image";
import { publicUrl } from "@/lib/r2-client";
import { Badge } from "@/components/ui/badge";

export function PropertyCard({
  href,
  title,
  subtitle,
  price,
  imageKey,
  tag,
}: {
  href: string;
  title: string;
  subtitle: string;
  price: string;
  imageKey?: string;
  tag?: string;
}) {
  const imgSrc = imageKey ? publicUrl(imageKey) : "/placeholder-property.svg";
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-smooth hover:shadow-md hover:translate-y-[-4px]"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-smooth group-hover:scale-110"
        />
        {tag ? <Badge className="animate-slide-left absolute left-3 top-3">{tag}</Badge> : null}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-smooth">{title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-3 text-lg font-bold text-teal-700 animate-pulse-glow">{price}</div>
      </div>
    </Link>
  );
}
