import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { choose, type Locale } from "@/lib/calendar";
import { artwork, type StoryImage } from "@/lib/content-schema";
import { origin } from "@/lib/site";
import type { ReactNode } from "react";

export function StructuredData({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}/>;
}
export function Breadcrumbs({ locale, items }: { locale: Locale; items: { label: string; href: string }[] }) {
  const all = [{ label: choose(locale, "Home", "প্রচ্ছদ"), href: "/" + locale }, ...items];
  return <><nav className="breadcrumbs" aria-label={choose(locale, "Breadcrumbs", "পাতার পথ")}>
    {all.map(({ label, href }, i) => i === all.length - 1 ? <span key={href} aria-current="page">{label}</span> :
      <span className="breadcrumbs" style={{ margin: 0 }} key={href}><Link href={href}>{label}</Link><ChevronRight size={13} aria-hidden="true"/></span>)}
  </nav><StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map(({ label, href }, index) => ({ "@type": "ListItem", position: index + 1, name: label, item: new URL(href, origin).href })) }}/></>;
}
export function EditorialHero({ locale, image, title, subtitle, children }: { locale: Locale; image: StoryImage; title: string; subtitle: string; children?: ReactNode }) {
  const visual = artwork[image];
  return <div className="article-hero">
    <Image src={visual.file} alt={visual.alt[locale]} fill sizes="(max-width: 900px) 94vw, 1192px" preload/>
    <div className="page-heading"><div className="article-labels">{children}</div><h1>{title}</h1><p>{subtitle}</p></div>
  </div>;
}