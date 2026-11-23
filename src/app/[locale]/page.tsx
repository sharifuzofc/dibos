import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Compass, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { Reveal, Tilt } from "@/components/interactions";
import { Newsletter } from "@/components/newsletter";
import { SectionHeading } from "@/components/section";
import { DiscoveryLabel, StoryCard, Verified } from "@/components/stories";
import { buttonVariants } from "@/components/ui/button";
import { choose, dayHref, formatDate, isLocale, monthLabel, months, number, shiftDate, storyHref, today } from "@/lib/calendar";
import { artwork, catalogCountries, categories, categoryLabels, countryLabel } from "@/lib/content-schema";
import { discovery } from "@/lib/discovery";
import { categoryIcons } from "@/lib/icons";
import { getObservances } from "@/lib/repository";
import { featuredSlugs, popularSlugs } from "@/lib/seed";
import { localizedMetadata, siteDescription, siteTimeZone } from "@/lib/site";

export const revalidate = 300;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return localizedMetadata(locale, "", choose(locale, "EveryDay — Every Date Has a Story", "EveryDay — প্রতিটি তারিখের একটি গল্প আছে"), siteDescription(locale));
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const current = today(siteTimeZone);
  const all = await getObservances();
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const feature = all.find(item => item.date === current.key);
  const daily = discovery(locale, current.key);
  const featureArt = artwork[feature?.image ?? daily.image];
  const calendar = all.map(({ slug, date, title, summary, category, country }) => ({ slug, date, title, summary, category, country }));
  const upcoming = Array.from({ length: 366 }, (_, index) => shiftDate(current.year, current.key, index + 1))
    .flatMap(day => all.filter(story => story.date === day.key).map(story => ({ story, year: day.year }))).slice(0, 4);
  const highlights = featuredSlugs.flatMap(slug => all.filter(story => story.slug === slug));
  const popular = popularSlugs.flatMap(slug => all.filter(story => story.slug === slug));
  const countries = catalogCountries(all);

  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stars" aria-hidden="true"/><div className="hero-orbit" aria-hidden="true"/>
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow"><Sparkles size={14}/>{t("THE WORLD, ONE DAY AT A TIME", "একটি করে দিনে বিশ্বকে জানুন")}</p>
          <h1 id="hero-title">{locale === "en" ? <>Every Day Has a<br/> Story Worth<br/> <em>Discovering.</em></> : <>প্রতিদিনের আছে<br/> <em>আবিষ্কারের মতো</em><br/> একটি গল্প।</>}</h1>
          <p className="hero-summary">{t("From global observances to local traditions, discover what makes today special and find a story for every date on the calendar.", "বৈশ্বিক দিবস থেকে স্থানীয় ঐতিহ্য, আজকের বিশেষত্ব জানুন এবং পঞ্জিকার প্রতিটি তারিখের গল্প খুঁজে নিন।")}</p>
          <div className="hero-buttons">
            <Link className={buttonVariants({})} href="#calendar"><CalendarDays size={17}/>{t("Explore the calendar", "পঞ্জিকা ঘুরে দেখুন")}</Link>
            <Link className={buttonVariants({ variant: "outline" })} href={"/" + locale + "/explore"}><Compass size={17}/>{t("Browse observances", "দিবসগুলো দেখুন")}</Link>
          </div>
          <div className="hero-stats">
            <div><span className="stat-icon"><CalendarDays size={17}/></span><span><strong>{number(locale, 365)}{t("+ days", "+ দিন")}</strong><small>{t("A full year of stories", "পুরো বছরের গল্প")}</small></span></div>
            <div><span className="stat-icon cyan"><Globe2 size={17}/></span><span><strong>{t("Global", "বিশ্বব্যাপী")}</strong><small>{t("Cultures & causes", "সংস্কৃতি ও উদ্যোগ")}</small></span></div>
            <div><span className="stat-icon pink"><ShieldCheck size={17}/></span><span><strong>{t("Verified", "যাচাইকৃত")}</strong><small>{t("Official sources", "আনুষ্ঠানিক সূত্র")}</small></span></div>
          </div>
        </div>
        <Tilt className="hero-feature-frame">
          <article className="hero-feature">
            <Image src={featureArt.file} alt={featureArt.alt[locale]} fill sizes="(max-width: 900px) 94vw, (max-width: 1200px) 48vw, 560px" preload/>
            <div className="feature-shade" aria-hidden="true"/>
            <div className="feature-top"><span><i/>{t("TODAY’S SPOTLIGHT", "আজকের বিশেষ গল্প")}</span><div className="date-stamp"><strong>{number(locale, current.day)}</strong><small>{monthLabel(locale, current.month, "short")}</small></div></div>
            <div className="feature-copy">
              {feature ? <Verified locale={locale}/> : <DiscoveryLabel locale={locale}/>}
              <h2>{feature?.title[locale] ?? daily.title}</h2>
              <p>{feature?.summary[locale] ?? t("Start with a small observation and see where it takes you.", "একটি ছোট পর্যবেক্ষণ দিয়ে শুরু করুন এবং দেখুন তা কোথায় নিয়ে যায়।")}</p>
              <Link className="feature-link" href={feature ? storyHref(locale, feature.slug) : dayHref(locale, current.key, current.year)}>{t("Read today’s story", "আজকের গল্প পড়ুন")} <ChevronRight size={17}/></Link>
            </div>
          </article>
        </Tilt>
      </div>
    </section>
    <div className="wrap home-sections">
      <section id="calendar" className="home-section">
        <SectionHeading label={t("THE CALENDAR", "পঞ্জিকা")} title={t("Pick a date, find a story.", "তারিখ বেছে নিন, গল্প খুঁজুন।")} description={t("Choose any day of the year to see its observances or a Daily Discovery.", "বছরের যেকোনো দিনের দিবস বা আজকের আবিষ্কার দেখতে তারিখ বেছে নিন।")}/>
        <Calendar locale={locale} current={current} stories={calendar}/>
      </section>
      <section id="upcoming" className="home-section"><Reveal>
        <SectionHeading label={t("ON THE HORIZON", "সামনে আসছে")} title={t("Upcoming observances", "আসন্ন দিবস")} action={<Link className="inline-link" href={"/" + locale + "/explore"}>{t("View all observances", "সব দিবস দেখুন")}<ChevronRight size={16}/></Link>}/>
        <div className="glass upcoming-list">{upcoming.map(({ story, year }) => {
          const Icon = categoryIcons[story.category];
          return <Link key={story.slug} className="upcoming-row" href={storyHref(locale, story.slug)}>
            <span className="upcoming-date"><strong>{number(locale, Number(story.date.slice(-2)))}</strong><small>{monthLabel(locale, Number(story.date.slice(0,2)), "short")}</small></span>
            <span className="category-icon" data-category={story.category}><Icon size={19}/></span><span className="upcoming-name"><strong>{story.title[locale]}</strong><small>{formatDate(locale, story.date)} · {number(locale, year)}</small></span>
            <span className="tag" data-category={story.category}>{categoryLabels[story.category][locale]}</span><ChevronRight className="row-chevron" size={19}/>
          </Link>;
        })}</div>
      </Reveal></section>
      <section id="stories" className="home-section"><Reveal>
        <SectionHeading label={t("EDITOR’S PICKS", "সম্পাদকের পছন্দ")} title={t("Featured stories", "নির্বাচিত গল্প")} description={t("Take a closer look at the histories behind these observances.", "এই দিবসগুলোর পেছনের ইতিহাস কাছ থেকে জানুন।")}/>
        <div className="story-grid">{highlights.map(story => <StoryCard key={story.slug} locale={locale} story={story}/>)}</div>
      </Reveal></section>
      <section id="categories" className="home-section"><Reveal>
        <SectionHeading label={t("FIND YOUR INTEREST", "আগ্রহের বিষয় খুঁজুন")} title={t("Browse by category", "বিষয় অনুযায়ী দেখুন")}/>
        <div className="category-grid">{categories.map(category => {
          const Icon = categoryIcons[category];
          return <Link className="glass category-card" key={category} href={"/" + locale + "/explore?category=" + category}><span className="category-icon" data-category={category}><Icon size={22}/></span><strong>{categoryLabels[category][locale]}</strong><span>{number(locale, all.filter(story => story.category === category).length)} {t("observances", "দিবস")}</span></Link>;
        })}</div>
      </Reveal></section>
      <section className="home-section browse-layout"><Reveal>
        <SectionHeading label={t("THE YEAR AT A GLANCE", "এক নজরে বছর")} title={t("Explore by month", "মাস অনুযায়ী দেখুন")}/>
        <div className="month-grid">{months.map(month => <Link key={month} className="glass month-card" href={"/" + locale + "/explore?month=" + month}>{monthLabel(locale, month, "short")}</Link>)}</div>
      </Reveal><Reveal>
        <SectionHeading label={t("AROUND THE WORLD", "বিশ্বজুড়ে")} title={t("Explore by country", "দেশ অনুযায়ী দেখুন")}/>
        <div className="country-list">{countries.map(country => <Link key={country} className="glass country-card" href={"/" + locale + "/explore?country=" + country}><span aria-hidden="true">{country === "global" ? <Globe2 size={20}/> : String.fromCodePoint(...[...country].map(letter => letter.charCodeAt(0) + 127365))}</span>{countryLabel(locale, country)}</Link>)}</div>
      </Reveal></section>
      <section className="home-section"><Reveal>
        <SectionHeading label={t("RECOGNIZED AROUND THE WORLD", "বিশ্বজুড়ে পরিচিত")} title={t("Popular observances", "জনপ্রিয় দিবস")} action={<a className="inline-link" href="https://www.un.org/en/observances/">{t("United Nations observances", "জাতিসংঘের দিবসসমূহ")}</a>}/>
        <div className="story-grid">{popular.map(story => <StoryCard key={story.slug} locale={locale} story={story}/>)}</div>
      </Reveal></section>
      <div className="home-section"><Newsletter locale={locale}/></div>
    </div>
  </>;
}
