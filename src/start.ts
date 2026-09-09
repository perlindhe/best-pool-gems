import { createStart, createMiddleware } from "@tanstack/react-start";

/** Consolidate www / http host variants on the apex domain with a 301. */
const canonicalHost = createMiddleware({ type: "request" }).server(async ({ next, request }) => {
  try {
    const url = new URL(request.url);
    const host = (request.headers.get("x-forwarded-host") ?? url.host).toLowerCase();
    const proto = (request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")).toLowerCase();
    const isSiteHost = host === "bestpoolhotels.com" || host === "www.bestpoolhotels.com";
    if (isSiteHost && !(host === "bestpoolhotels.com" && proto === "https")) {
      return new Response(null, {
        status: 301,
        headers: { location: `https://bestpoolhotels.com${url.pathname}${url.search}` },
      });
    }
  } catch {
    // fall through to the normal handler
  }
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalHost],
}));
