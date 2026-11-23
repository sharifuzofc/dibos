import type { MetadataRoute } from "next";
import { isIndexable, origin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: isIndexable ? "/" : undefined, disallow: isIndexable ? ["/admin", "/api/"] : "/" },
    sitemap: new URL("/sitemap.xml", origin).href,
  };
}