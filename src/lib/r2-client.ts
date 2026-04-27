// Client-safe helpers that do NOT import the AWS SDK.
export function publicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? process.env.R2_PUBLIC_BASE_URL;
  if (!base) return "/placeholder-property.svg";
  return `${base.replace(/\/$/, "")}/${key}`;
}
