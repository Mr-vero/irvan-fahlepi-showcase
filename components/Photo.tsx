import { photoSrcSet, photoUrl, type PhotoKey } from "@/lib/photos";

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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      style={style}
      src={photoUrl(name, 1200, ratio ? Math.round(1200 * ratio) : undefined)}
      srcSet={photoSrcSet(name, ratio)}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      crossOrigin="anonymous"
    />
  );
}
