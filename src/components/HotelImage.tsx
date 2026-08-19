import type { ImgHTMLAttributes } from "react";

/**
 * Hotel photo with reserved dimensions (no layout shift), lazy loading and
 * responsive sizes. Google Places / Supabase-hosted photos accept a width
 * hint, so we build a srcSet where possible.
 */
function buildSrcSet(src: string): string | undefined {
  try {
    const url = new URL(src, "https://bestpoolhotels.com");
    // Google Places photo proxy + Supabase transform both accept a width param.
    const widthParam = url.searchParams.has("maxwidth")
      ? "maxwidth"
      : url.searchParams.has("width")
        ? "width"
        : null;
    if (!widthParam) return undefined;
    return [480, 768, 1200, 1600]
      .map((w) => {
        const u = new URL(url.toString());
        u.searchParams.set(widthParam, String(w));
        return `${u.toString()} ${w}w`;
      })
      .join(", ");
  } catch {
    return undefined;
  }
}

export function HotelImage({
  src,
  alt,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  const srcSet = buildSrcSet(src);
  return (
    <img
      {...rest}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={{ aspectRatio: `${width} / ${height}`, ...(rest.style ?? {}) }}
    />
  );
}
