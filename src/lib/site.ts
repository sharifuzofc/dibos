import type { Metadata } from "next";
import { choose, type Locale } from "./calendar";

export const origin = new URL(process.env.SITE_URL ?? "http://localhost:3000");
export const isIndexable = process.env.SITE_INDEXABLE === "true" && origin.protocol === "https:" && !["localhost", "127.0.0.1"].includes(origin.hostname);
export const siteTimeZone = process.env.SITE_TIME_ZONE ?? "Asia/Dhaka";

export function localizedMetadata(locale: Locale, path: string, title: string, description: string, image = "/images/earth.webp"): Metadata {
  const canonical = "/" + locale + path;
  return {
    metadataBase: origin,
    title,
    description,
    alternates: { canonical, languages: { en: "/en" + path, bn: "/bn" + path, "x-default": "/en" + path } },
    openGraph: { title, description, images: [image], url: canonical, locale: locale === "bn" ? "bn_BD" : "en_US", siteName: "EveryDay", type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: { index: isIndexable, follow: isIndexable },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  };
}
export const siteDescription = (locale: Locale) => choose(locale,
  "Discover verified observances, cultural traditions and daily stories from around the world.",
  "বিশ্বজুড়ে যাচাইকৃত দিবস, সাংস্কৃতিক ঐতিহ্য ও প্রতিদিনের গল্প আবিষ্কার করুন।");
