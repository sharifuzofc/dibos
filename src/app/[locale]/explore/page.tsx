import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/editorial";
import { Explore } from "@/components/explore";
import { StoryCard } from "@/components/stories";
import { choose, isLocale } from "@/lib/calendar";
import { catalogCountries, categories } from "@/lib/content-schema";
import { getObservances } from "@/lib/repository";
import { localizedMetadata, siteDescription } from "@/lib/site";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? localizedMetadata(locale, "/explore", choose(locale, "Explore observances | EveryDay", "দিবসগুলো দেখুন | EveryDay"), siteDescription(locale)) : {};
}
export default async function ExplorePage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const title = t("Explore observances", "দিবসগুলো ঘুরে দেখুন");
  const query = await searchParams;
  const stories = await getObservances();
  const value = (key: string) => typeof query[key] === "string" ? query[key] : "";
  const initial = { q: value("q").slice(0,120), month: /^(?:[1-9]|1[0-2])$/.test(value("month")) ? value("month") : "",
    category: categories.find(key => key === value("category")) ?? "", country: catalogCountries(stories).find(key => key === value("country")) ?? "" };
  const entries = stories.map(({ slug, title, summary, date, category, country }) => ({ slug, title, summary, date, category, country }));
  return <section className="wrap subpage"><Breadcrumbs locale={locale} items={[{ label: title, href: "/" + locale + "/explore" }]}/>
    <div className="page-heading"><p className="eyebrow">{t("THE OBSERVANCE INDEX", "দিবসের সূচি")}</p><h1>{title}</h1><p>{t("Find a verified observance by name, topic, country or month.", "নাম, বিষয়, দেশ বা মাস অনুযায়ী যাচাইকৃত দিবস খুঁজুন।")}</p></div>
    <Explore key={JSON.stringify(initial)} locale={locale} initial={initial} entries={entries}>{stories.map(story => <StoryCard key={story.slug} locale={locale} story={story}/>)}</Explore>
  </section>;
}
