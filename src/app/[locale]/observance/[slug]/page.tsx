import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, EditorialHero, StructuredData } from "@/components/editorial";
import { Favorite, Share } from "@/components/interactions";
import { StoryCard, Verified } from "@/components/stories";
import { choose, dayHref, formatDate, isLocale, storyHref } from "@/lib/calendar";
import { artwork, categoryLabels, countryLabel } from "@/lib/content-schema";
import { getObservances } from "@/lib/repository";
import { seed } from "@/lib/seed";
import { localizedMetadata, origin } from "@/lib/site";

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() { return seed.map(story => ({ slug: story.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const story = (await getObservances()).find(item => item.slug === slug);
  if (!story) return {};
  return localizedMetadata(locale, "/observance/" + slug, story.title[locale] + " | EveryDay", story.summary[locale], artwork[story.image].file);
}

export default async function ObservancePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const all = await getObservances();
  const story = all.find(item => item.slug === slug);
  if (!story) notFound();
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const title = story.title[locale], date = formatDate(locale, story.date), href = storyHref(locale, slug);
  const related = all.filter(item => item.slug !== slug && (item.date === story.date || item.category === story.category)).sort((a, b) => Number(b.date === story.date) - Number(a.date === story.date)).slice(0, 3);
  const content = [[t("History and origin", "ইতিহাস ও উৎপত্তি"), story.history], [t("Why it matters", "কেন গুরুত্বপূর্ণ"), story.significance], [t("A fact worth knowing", "জানার মতো একটি তথ্য"), story.fact], [t("How to take part", "কীভাবে অংশ নেবেন"), story.participate]] as const;

  return <article className="wrap subpage">
    <Breadcrumbs locale={locale} items={[{ label: date, href: dayHref(locale, story.date) }, { label: title, href }]}/>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: title, description: story.summary[locale], inLanguage: locale, image: new URL(artwork[story.image].file, origin).href, mainEntityOfPage: new URL(href, origin).href, publisher: { "@type": "Organization", name: "EveryDay" }, citation: story.sources.map(source => source.url) }}/>
    <EditorialHero locale={locale} image={story.image} title={title} subtitle={story.summary[locale]}><Verified locale={locale}/></EditorialHero>
    <div className="article-actions"><Link className="button button-outline" href={dayHref(locale, story.date)}>{date}</Link><span className="tag" data-category={story.category}>{categoryLabels[story.category][locale]}</span><span>{countryLabel(locale, story.country)}</span><Favorite locale={locale} slug={slug}/><Share locale={locale} title={title}/></div>
    <div className="article-details">
      <div className="editorial">{content.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text[locale]}</p></section>)}</div>
      <aside className="glass source-panel"><h2>{t("Sources", "সূত্র")}</h2><ul>{story.sources.map(source => <li key={source.url}><a className="inline-link" href={source.url}>{source.name}</a></li>)}</ul><p>{t("Artwork: AI-generated editorial illustration.", "চিত্র: কৃত্রিম বুদ্ধিমত্তায় তৈরি সম্পাদকীয় চিত্র।")}</p></aside>
    </div>
    {related.length > 0 && <section className="related-section"><h2>{t("Related observances", "সংশ্লিষ্ট দিবস")}</h2><div className="story-grid">{related.map(item => <StoryCard key={item.slug} locale={locale} story={item}/>)}</div></section>}
  </article>;
}
