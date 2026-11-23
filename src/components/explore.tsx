"use client";

import { useState, type ReactNode } from "react";
import { choose, formatDate, monthLabel, months, number, type Locale } from "@/lib/calendar";
import { catalogCountries, categories, categoryLabels, countryLabel } from "@/lib/content-schema";
import type { SearchEntry } from "./header";
import { Button } from "./ui/button";

export type Filters = { q: string; category: string; country: string; month: string };

export function Explore({ locale, initial, entries, children }: { locale: Locale; initial: Filters; entries: SearchEntry[]; children: ReactNode[] }) {
  const [filter, setFilter] = useState(initial);
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const update = (next: Filters) => {
    setFilter(next);
    const query = new URLSearchParams(Object.entries(next).filter(([, value]) => value));
    window.history.replaceState(null, "", location.pathname + (query.size ? "?" + query : ""));
  };
  const set = (key: keyof Filters, value: string) => update({ ...filter, [key]: value });
  const selected = entries.map((entry, index) => ({ entry, index })).filter(({ entry }) =>
    (!filter.category || entry.category === filter.category) &&
    (!filter.country || entry.country === filter.country) &&
    (!filter.month || Number(entry.date.slice(0,2)) === Number(filter.month)) &&
    (!filter.q.trim() || [entry.title.en, entry.title.bn, entry.summary[locale], entry.date, formatDate(locale, entry.date)].join(" ").toLowerCase().includes(filter.q.trim().toLowerCase())));
  return <>
    <div className="glass filters">
      <label className="search-filter">{t("Search", "অনুসন্ধান")}<input className="form-control" type="search" value={filter.q} maxLength={120} placeholder={t("e.g. oceans or June 8", "যেমন মহাসাগর বা ৮ জুন")} onChange={event => set("q", event.target.value)}/></label>
      <label>{t("Category", "বিষয়")}<select value={filter.category} onChange={event => set("category", event.target.value)}><option value="">{t("All categories", "সব বিষয়")}</option>{categories.map(key => <option key={key} value={key}>{categoryLabels[key][locale]}</option>)}</select></label>
      <label>{t("Country", "দেশ")}<select value={filter.country} onChange={event => set("country", event.target.value)}><option value="">{t("All countries", "সব দেশ")}</option>{catalogCountries(entries).map(key => <option key={key} value={key}>{countryLabel(locale, key)}</option>)}</select></label>
      <label>{t("Month", "মাস")}<select value={filter.month} onChange={event => set("month", event.target.value)}><option value="">{t("All months", "সব মাস")}</option>{months.map(month => <option key={month} value={month}>{monthLabel(locale, month)}</option>)}</select></label>
      <Button variant="outline" onClick={() => update({ q: "", category: "", country: "", month: "" })}>{t("Clear", "মুছুন")}</Button>
    </div>
    <p role="status" className="muted results-count">{number(locale, selected.length)} {selected.length === 1 ? t("observance", "দিবস") : t("observances", "দিবস")}</p>
    {selected.length ? <div className="story-grid">{selected.map(({ entry, index }) => <div className="explore-result" key={entry.slug}>{children[index]}</div>)}</div> : <p className="muted">{t("No observances match these filters.", "এই বাছাইয়ে কোনো দিবস মেলেনি।")}</p>}
  </>;
}
