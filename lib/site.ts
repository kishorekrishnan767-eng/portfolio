import { site } from "@/data/content";

/** Canonical origin: explicit env → Vercel production URL → content fallback. */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : site.url);
