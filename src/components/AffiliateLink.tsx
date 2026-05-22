import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Affiliate / sponsored outbound link.
 * Always emits rel="sponsored nofollow noopener" and target="_blank".
 * Use for any commission-generating link (Booking.com, Hotels.com,
 * direct hotel booking deeplinks, etc.).
 */
export function AffiliateLink({
  href,
  children,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
    >
      {children}
    </a>
  );
}
