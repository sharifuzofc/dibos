"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, CalendarDays, Globe2, Menu, Moon, Search, Sun, X } from "lucide-react";
import { allDates, choose, dayHref, formatDate, storyHref, type Locale } from "@/lib/calendar";
import { categoryLabels, type Observance } from "@/lib/content-schema";
import { Button } from "./ui/button";
import { useFavorites } from "./interactions";

export type SearchEntry = Pick<Observance, "title" | "summary" | "date" | "slug" | "category" | "country">;

export function Header({ locale, stories }: { locale: Locale; stories: SearchEntry[] }) {
  const path = usePathname() ?? "/" + locale;
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"search" | "favorites">("search");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [light, setLight] = useState(false);
  const { favorites } = useFavorites();
  const home = "/" + locale;
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const links = [
    [home, t("Home", "প্রচ্ছদ")],
    [home + "#calendar", t("Calendar", "পঞ্জিকা")],
    [home + "/explore", t("Explore", "ঘুরে দেখুন")],
    [home + "#stories", t("Stories", "গল্প")],
  ];
  useEffect(() => {
    try {
      const theme = localStorage.getItem("everyday-theme");
      if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    } catch {}
    setLight(document.documentElement.dataset.theme === "light");
  }, [path]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMode("search");
        if (!dialog.current?.open) dialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const open = (next: typeof mode) => {
    setMode(next);
    setQuery("");
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const theme = () => {
    const value = light ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    setLight(!light);
    try { localStorage.setItem("everyday-theme", value); } catch {}
  };
  const term = query.trim().toLowerCase();
  const filtered = mode === "favorites" ? stories.filter(item => favorites.includes(item.slug)) :
    stories.filter(item => [item.title.en, item.title.bn, item.summary[locale], item.date, categoryLabels[item.category][locale], formatDate(locale, item.date)].join(" ").toLowerCase().includes(term));
  const matchingDate = mode === "search" && term ? allDates.find(key => term === key || term === formatDate(locale, key).toLowerCase()) : undefined;
  const switchPath = (locale === "en" ? "/bn" : "/en") + path.replace(/^\/(en|bn)(?=\/|$)/, "");
  return <header className="topbar">
    <div className="wrap nav-inner">
      <Link className="brand" href={home}><span className="logo"><CalendarDays size={20} strokeWidth={2.4} /></span><span>Every<span>Day</span><i>.</i></span></Link>
      <nav aria-label={t("Main navigation", "প্রধান নেভিগেশন")} className={"main-nav " + (menu ? "is-open" : "")}>
        {links.map(([href, label]) => <Link key={href} href={href} className={path === href ? "active" : ""} onClick={() => setMenu(false)}>{label}</Link>)}
      </nav>
      <div className="tools">
        <span className="search-tool">
          <Button variant="ghost" className="search-trigger" aria-label={t("Search", "খুঁজুন")} aria-keyshortcuts="Control+K Meta+K" onClick={() => open("search")}><Search size={17}/><span>{t("Search", "খুঁজুন")}</span></Button>
          <kbd aria-hidden="true">Ctrl K</kbd>
        </span>
        <Button variant="icon" className="saved-trigger" aria-label={t("Favorites", "পছন্দের তালিকা")} onClick={() => open("favorites")}><Bookmark size={17}/></Button>
        <Link className="language-button" href={switchPath} aria-label={t("বাংলা · Read in Bengali", "EN · ইংরেজিতে পড়ুন")} onNavigate={event => {
          if (!location.search && !location.hash) return;
          event.preventDefault();
          router.push(switchPath + location.search + location.hash);
        }}><Globe2 size={17}/><span lang={locale === "en" ? "bn" : "en"}>{t("বাংলা", "EN")}</span></Link>
        <Button variant="icon" aria-label={t("Toggle theme", "থিম বদলান")} aria-pressed={light} onClick={theme}>{light ? <Moon size={17}/> : <Sun size={17}/>}</Button>
        <Button variant="icon" className="menu-trigger" aria-label={t("Toggle navigation", "নেভিগেশন খুলুন")} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={19}/> : <Menu size={19}/>}</Button>
      </div>
    </div>
    <dialog ref={dialog} className="search-dialog" aria-labelledby="search-title">
      <div className="dialog-heading"><h2 id="search-title">{mode === "search" ? t("Find an observance", "দিবস খুঁজুন") : t("Your favorites", "আপনার পছন্দের তালিকা")}</h2><Button variant="icon" aria-label={t("Close", "বন্ধ করুন")} onClick={() => dialog.current?.close()}><X size={19}/></Button></div>
      {mode === "search" && <label className="search-field"><Search size={19}/><input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Search by name or date…", "নাম বা তারিখ দিয়ে খুঁজুন…")} aria-label={t("Search by name or date", "নাম বা তারিখ দিয়ে খুঁজুন")} /></label>}
      <div className="search-results" aria-live="polite">
        {matchingDate && <Link className="search-result" href={dayHref(locale, matchingDate)} onClick={() => dialog.current?.close()}><strong>{formatDate(locale, matchingDate)}</strong><span>{t("Open date page", "তারিখের পাতা খুলুন")}</span></Link>}
        {filtered.slice(0, 12).map(story => <Link className="search-result" key={story.slug} href={storyHref(locale, story.slug)} onClick={() => dialog.current?.close()}><strong>{story.title[locale]}</strong><span>{formatDate(locale, story.date)} · {categoryLabels[story.category][locale]}</span></Link>)}
        {filtered.length === 0 && !matchingDate && <p>{mode === "favorites" ? t("Save a story to find it here.", "গল্প সংরক্ষণ করলে এখানে পাবেন।") : t("No matching observances.", "মিলে যায় এমন দিবস পাওয়া যায়নি।")}</p>}
      </div>
      {mode === "search" && <Link className="inline-link" href={home + "/explore" + (query ? "?q=" + encodeURIComponent(query) : "")} onClick={() => dialog.current?.close()}>{t("Open full search", "পূর্ণ অনুসন্ধান খুলুন")}</Link>}
    </dialog>
  </header>;
}
