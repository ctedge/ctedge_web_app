import imageUrlBuilder from "@sanity/image-url";
import { sanity } from "./sanity";

const builder = sanity ? imageUrlBuilder(sanity) : null;

export function urlForImage(source: unknown) {
  if (!builder || !source) return null;
  return builder.image(source as never);
}
