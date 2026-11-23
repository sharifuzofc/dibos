import type { MetadataRoute } from "next";
import { allDates, locales } from "@/lib/calendar";
import { getObservances } from "@/lib/repository";
import { origin } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getObservances();
  const paths = ["", "/explore", "/about", ...allDates.map(key => "/day/" + key), ...stories.map(story => "/observance/" + story.slug)];
  return locales.flatMap(locale => paths.map(path => ({
    url: new URL("/" + locale + path, origin).href,
    alternates: { languages: Object.fromEntries(locales.map(language => [language, new URL("/" + language + path, origin).href])) },
  })));
}