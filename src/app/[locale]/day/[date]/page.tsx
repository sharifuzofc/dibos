import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs, EditorialHero } from "@/components/editorial";
import { DiscoveryLabel, StoryCard } from "@/components/stories";
import { buttonVariants } from "@/components/ui/button";
import { allDates, choose, dayHref, daysInMonth, formatDate, isDateKey, isLocale, shiftDate, today } from "@/lib/calendar";
import { artwork } from "@/lib/content-schema";
import { discovery } from "@/lib/discovery";
import { getObservances } from "@/lib/repository";
import { localizedMetadata, siteTimeZone } from "@/lib/site";
import { Share } from "@/components/interactions";

export const revalidate = 3600;
export const dynamicParams = false;
type Props = { params: Promise<{ locale: string; date: string }>; searchParams: Promise<{ year?: string | string[] }> };
export function generateStaticParams() { return allDates.map(date => ({ date })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isLocale(locale) || !isDateKey(date)) return {};
  const stories = (await getObservances()).filter(story => story.date === date);
  const daily = discovery(locale, date);
  return localizedMetadata(locale, "/day/" + date, formatDate(locale, date) + choose(locale, " | EveryDay", " | EveryDay"),
    stories.length ? stories.map(story => story.title[locale]).join(" · ") : daily.title + " · " + choose(locale, "Daily Discovery", "আজকের আবিষ্কার"),
    artwork[stories[0]?.image ?? daily.image].file);
}

export default async function DayPage({ params, searchParams }: Props) {
  const { locale, date } = await params;
  if (!isLocale(locale) || !isDateKey(date)) notFound();
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const all = await getObservances();
  const stories = all.filter(story => story.date === date);
  const daily = discovery(locale, date);
  const name = formatDate(locale, date);
  const { year: rawYear } = await searchParams;
  const [month, day] = date.split("-").map(Number);
  const requested = typeof rawYear === "string" && /^\d{4}$/.test(rawYear) ? Number(rawYear) : today(siteTimeZone).year;
  const valid = requested >= 1900 && requested <= 2100;
  let year = valid ? requested : today(siteTimeZone).year;
  while (day > daysInMonth(year, month)) year++;
  const previous = shiftDate(year, date, -1), next = shiftDate(year, date, 1);
  const nearby = Array.from({ length: 45 }, (_, index) => [
    shiftDate(year, date, index + 1).key, shiftDate(year, date, -index - 1).key,
  ]).flat();
  const related = stories.length ? [] : nearby.flatMap(key => all.filter(story => story.date === key)).slice(0, 3);
  const adjacent = (key: string, linkYear: number) => dayHref(locale, key, linkYear >= 1900 && linkYear <= 2100 ? linkYear : undefined);

  return <div className="wrap subpage">
    <Breadcrumbs locale={locale} items={[{ label: name, href: dayHref(locale, date) }]}/>
    <EditorialHero locale={locale} image={stories[0]?.image ?? daily.image} title={name}
      subtitle={stories.length ? t("Explore the verified observances associated with this date.", "এই তারিখের যাচাইকৃত দিবসগুলো ঘুরে দেখুন।") : t("An editorial activity for your day.", "আপনার দিনের জন্য একটি সম্পাদকীয় কার্যক্রম।")}>
      {!stories.length && <DiscoveryLabel locale={locale}/>}
    </EditorialHero>
    <div className="article-actions"><Share locale={locale} title={name}/></div>
    <nav className="day-navigation" aria-label={t("Adjacent dates", "পাশের তারিখ")}>
      <Link className={buttonVariants({ variant: "outline" })} href={adjacent(previous.key, previous.year)} rel="prev" aria-label={t("Previous date", "আগের তারিখ") + ": " + formatDate(locale, previous.key)}><ChevronLeft size={17}/>{formatDate(locale, previous.key)}</Link>
      <Link className={buttonVariants({ variant: "outline" })} href={adjacent(next.key, next.year)} rel="next" aria-label={t("Next date", "পরের তারিখ") + ": " + formatDate(locale, next.key)}>{formatDate(locale, next.key)}<ChevronRight size={17}/></Link>
    </nav>
    {stories.length ? <section className="related-section"><h2>{t("Observances on this date", "এই তারিখের দিবস")}</h2><div className="story-grid">{stories.map(story => <StoryCard key={story.slug} locale={locale} story={story}/>)}</div></section> :
      <section className="editorial related-section"><h2>{daily.title}</h2><p>{daily.prompt}</p>
        {daily.source && <a className="inline-link" href={daily.source}>{t("Learn more from the U.S. Naval Observatory", "মার্কিন নৌ মানমন্দির থেকে আরও জানুন")}</a>}
      </section>}
    {related.length > 0 && <section className="related-section"><h2>{t("Observances on nearby dates", "কাছাকাছি তারিখের দিবস")}</h2><div className="story-grid">{related.map(story => <StoryCard key={story.slug} locale={locale} story={story}/>)}</div></section>}
  </div>;
}
