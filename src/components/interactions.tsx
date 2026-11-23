"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Bookmark, Check, Share2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { choose, type Locale } from "@/lib/calendar";
import { Button } from "./ui/button";

const favoritesKey = "everyday-favorites";
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    const read = () => {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]");
        if (Array.isArray(value)) setFavorites(value.filter((item): item is string => typeof item === "string"));
      } catch {}
    };
    read();
    window.addEventListener("everyday-favorites", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("everyday-favorites", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return {
    favorites,
    toggle(slug: string) {
      const next = favorites.includes(slug) ? favorites.filter(value => value !== slug) : [...favorites, slug];
      try {
        localStorage.setItem(favoritesKey, JSON.stringify(next));
        window.dispatchEvent(new Event("everyday-favorites"));
      } catch { setFavorites(next); }
    },
  };
}
export function Favorite({ locale, slug, compact }: { locale: Locale; slug: string; compact?: boolean }) {
  const { favorites, toggle } = useFavorites();
  const saved = favorites.includes(slug);
  const label = saved ? choose(locale, "Remove from favorites", "পছন্দের তালিকা থেকে সরান") : choose(locale, "Save to favorites", "পছন্দের তালিকায় রাখুন");
  return <Button variant={compact ? "icon" : "outline"} aria-label={label} aria-pressed={saved} title={label} onClick={() => toggle(slug)}>
    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />{!compact && label}
  </Button>;
}
export function Share({ locale, title }: { locale: Locale; title: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const label = choose(locale, "Share", "শেয়ার করুন");
  return <><Button variant="outline" onClick={async () => {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("error");
    }
  }}>{status === "copied" ? <Check size={17} /> : <Share2 size={17} />}{label}</Button>
  <span role="status">{status === "copied" ? choose(locale, "Link copied", "লিংক কপি হয়েছে") : status === "error" ? choose(locale, "Use the address bar to copy the link.", "লিংক কপি করতে ঠিকানা বার ব্যবহার করুন।") : ""}</span></>;
}
export function Tilt({ children, className }: { children: ReactNode; className: string }) {
  const reduced = useReducedMotion();
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    event.currentTarget.style.setProperty("--rx", (y * -5) + "deg");
    event.currentTarget.style.setProperty("--ry", (x * 5) + "deg");
    event.currentTarget.style.setProperty("--light-x", ((x + .5) * 100) + "%");
    event.currentTarget.style.setProperty("--light-y", ((y + .5) * 100) + "%");
  };
  return <div className={"tilt " + className} onPointerMove={move} onPointerLeave={event => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }}>{children}</div>;
}
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current?.animate || typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (entry.boundingClientRect.top > window.innerHeight * .45) {
        node.animate([{ transform: "translateY(12px)", opacity: .72 }, { transform: "translateY(0)", opacity: 1 }], { duration: 400, easing: "cubic-bezier(.2,.75,.3,1)" });
      }
      observer.disconnect();
    }, { threshold: .12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);
  return <motion.div ref={ref}>{children}</motion.div>;
}
