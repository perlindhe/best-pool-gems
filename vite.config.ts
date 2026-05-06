import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    prerender: {
      enabled: true,
      crawlLinks: true,
      retryCount: 2,
    },
    pages: [
      { path: "/", prerender: { enabled: true, crawlLinks: true } },
      { path: "/about", prerender: { enabled: true } },
      { path: "/disclosure", prerender: { enabled: true } },
      { path: "/cookies", prerender: { enabled: true } },
      { path: "/integritetspolicy", prerender: { enabled: true } },
      { path: "/barcelona", prerender: { enabled: true } },
      { path: "/paris", prerender: { enabled: true } },
      { path: "/london", prerender: { enabled: true } },
      { path: "/new-york", prerender: { enabled: true } },
      { path: "/barcelona/luxury-pool-hotels", prerender: { enabled: true } },
      { path: "/barcelona/rooftop-pool-hotels", prerender: { enabled: true } },
      { path: "/barcelona/pool-hotels-near-beach", prerender: { enabled: true } },
      { path: "/barcelona/pool-season", prerender: { enabled: true } },
    ],
  },
});
