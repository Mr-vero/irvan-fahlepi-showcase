import { preload } from "react-dom";
import { isLocal, photoSrcSet, photoUrl, type PhotoKey } from "@/lib/photos";

type Props = {
  name: PhotoKey;
  alt: string;
  /** Height / width, to crop every size in the srcset to the same shape. */
  ratio?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/** A responsive Unsplash photo. Lazy by default; `priority` for the first screen. */
export default function Photo({ name, alt, ratio, sizes = "100vw", className, priority, style }: Props) {
  const src = photoUrl(name, 1200, ratio ? Math.round(1200 * ratio) : undefined);
  const srcSet = photoSrcSet(name, ratio);
  // First-screen photos are announced in the document head so the browser fetches them before CSS and JS.
  if (priority) preload(src, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });
  const local = isLocal(name, ratio);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      style={style}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      crossOrigin={local ? undefined : "anonymous"}
    />
  );
}
