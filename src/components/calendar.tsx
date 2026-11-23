"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Compass, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { choose, dateKey, dayHref, daysInMonth, formatDate, monthLabel, months, number, storyHref, weekdayLabels, type Locale, type today } from "@/lib/calendar";
import { categories, categoryLabels } from "@/lib/content-schema";
import type { SearchEntry } from "./header";
import { Button, buttonVariants } from "./ui/button";

export function Calendar({ locale, current, stories }: { locale: Locale; current: ReturnType<typeof today>; stories: SearchEntry[] }) {
  const [position, setPosition] = useState({ year: current.year, month: current.month });
  const [selectedDay, setSelectedDay] = useState(current.day);
  const reduced = useReducedMotion();
  const { year, month } = position;
  const count = daysInMonth(year, month);
  const first = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const selection = dateKey(month, Math.min(selectedDay, count));
  const byDate = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const story of stories) map.set(story.date, [...(map.get(story.date) ?? []), story]);
    return map;
  }, [stories]);
  const selected = byDate.get(selection) ?? [];
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const select = (nextYear: number, nextMonth: number) => {
    if (nextYear >= 1900 && nextYear <= 2100) setPosition({ year: nextYear, month: nextMonth });
  };
  const move = (direction: number) => {
    const date = new Date(Date.UTC(year, month - 1 + direction, 1));
    select(date.getUTCFullYear(), date.getUTCMonth() + 1);
  };
  const jump = () => { setPosition({ year: current.year, month: current.month }); setSelectedDay(current.day); };
  return <div className="calendar-layout">
    <div className="glass calendar-panel">
      <div className="calendar-controls">
        <div className="calendar-select">
          <label><span className="sr-only">{t("Month", "মাস")}</span><select value={month} onChange={event => select(year, Number(event.target.value))}>{months.map(item => <option key={item} value={item}>{monthLabel(locale, item)}</option>)}</select></label>
          <label><span className="sr-only">{t("Year", "বছর")}</span><select value={year} onChange={event => select(Number(event.target.value), month)}>{Array.from({ length: 201 }, (_, i) => i + 1900).map(item => <option key={item} value={item}>{number(locale, item)}</option>)}</select></label>
        </div>
        <div className="calendar-actions">
          <Button variant="ghost" className="today-button" onClick={jump}>{t("Today", "আজ")}</Button>
          <Button variant="icon" disabled={year === 1900 && month === 1} aria-label={t("Previous month", "আগের মাস")} onClick={() => move(-1)}><ChevronLeft size={19}/></Button>
          <Button variant="icon" disabled={year === 2100 && month === 12} aria-label={t("Next month", "পরের মাস")} onClick={() => move(1)}><ChevronRight size={19}/></Button>
        </div>
      </div>
      <div className="calendar-grid weekdays" aria-hidden="true">{weekdayLabels(locale).map(day => <span key={day}>{day}</span>)}</div>
      <motion.div key={year + "-" + month} className="calendar-grid" initial={reduced ? false : { opacity: .55, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 285, damping: 26 }}>
        {Array.from({ length: first }, (_, i) => <span key={"offset-" + i} className="calendar-blank"/>)}
        {Array.from({ length: count }, (_, i) => {
          const day = i + 1, key = dateKey(month, day);
          const matches = byDate.get(key) ?? [];
          const isToday = year === current.year && key === current.key;
          return <Link key={key} href={dayHref(locale, key, year)} prefetch={false}
            aria-label={formatDate(locale, key) + (matches.length ? ", " + number(locale, matches.length) + " " + t("observances", "দিবস") : "")}
            aria-current={isToday ? "date" : undefined} className={"calendar-day" + (key === selection ? " selected" : "") + (isToday ? " today" : "")}
            onFocus={() => setSelectedDay(day)} onPointerEnter={() => setSelectedDay(day)}>
            {number(locale, day)}
            <span className="day-dots" aria-hidden="true">{[...new Set(matches.map(story => story.category))].map(category => <i key={category} data-category={category}/>)}</span>
          </Link>;
        })}
      </motion.div>
      <div className="calendar-legend">{categories.map(category => <span key={category}><i data-category={category}/>{categoryLabels[category][locale]}</span>)}</div>
    </div>
    <aside className="glass calendar-preview">
      <div className="preview-icon"><CalendarDays size={22}/></div>
      <p className="eyebrow">{selection === current.key && year === current.year ? t("Today on the calendar", "পঞ্জিকায় আজ") : t("Selected date", "নির্বাচিত তারিখ")}</p>
      <h3>{formatDate(locale, selection)}</h3>
      {selected.length ? <ul className="preview-events">{selected.map(story => <li key={story.slug}><Link href={storyHref(locale, story.slug)}><span className="tag" data-category={story.category}>{categoryLabels[story.category][locale]}</span><strong>{story.title[locale]}</strong></Link></li>)}</ul> :
        <p className="muted"><Sparkles size={16}/> {t("A Daily Discovery awaits.", "আজকের আবিষ্কার আপনার অপেক্ষায়।")}</p>}
      <Link href={dayHref(locale, selection, year)} className={buttonVariants({ variant: "outline" })}><Compass size={16}/>{t("Explore this date", "তারিখটি ঘুরে দেখুন")}</Link>
    </aside>
  </div>;
}
