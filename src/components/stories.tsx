import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Sparkles } from "lucide-react";
import { choose, formatDate, storyHref, type Locale } from "@/lib/calendar";
import { artwork, categoryLabels, type Observance } from "@/lib/content-schema";
import { Favorite } from "./interactions";

export function StoryCard({ locale, story }: { locale: Locale; story: Observance }) {
  const art = artwork[story.image];
  const href = storyHref(locale, story.slug);
  return <article className="glass story-card">
    <Link href={href} className="story-image" tabIndex={-1} aria-hidden="true"><Image src={art.file} alt="" fill sizes="(max-width: 640px) 94vw, (max-width: 900px) 46vw, 375px" /></Link>
    <div className="story-meta"><span className="tag" data-category={story.category}>{categoryLabels[story.category][locale]}</span><span><CalendarDays size={14}/>{formatDate(locale, story.date)}</span></div>
    <div className="story-body"><h3><Link href={href}>{story.title[locale]}</Link></h3><p>{story.summary[locale]}</p></div>
    <div className="story-card-footer"><Link className="inline-link" href={href} aria-label={choose(locale, "Read story", "গল্প পড়ুন") + ", " + story.title[locale]}>{choose(locale, "Read story", "গল্প পড়ুন")}</Link><Favorite locale={locale} slug={story.slug} compact/></div>
  </article>;
}
export function Verified({ locale }: { locale: Locale }) {
  return <span className="verified"><Check size={13} strokeWidth={3}/>{choose(locale, "Verified observance", "যাচাইকৃত দিবস")}</span>;
}
export function DiscoveryLabel({ locale }: { locale: Locale }) {
  return <span className="verified discovery-label"><Sparkles size={14}/>{choose(locale, "Daily Discovery", "আজকের আবিষ্কার")}</span>;
}
