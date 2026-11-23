import { z } from "zod";
import { choose, isDateKey, type Locale } from "./calendar.ts";

export const categories = ["nature", "culture", "education", "health", "rights", "science"] as const;
export const images = ["earth", "ocean", "library", "forest"] as const;
export const categoryLabels = {
  nature: { en: "Environment", bn: "পরিবেশ" },
  culture: { en: "Culture", bn: "সংস্কৃতি" },
  education: { en: "Education", bn: "শিক্ষা" },
  health: { en: "Health", bn: "স্বাস্থ্য" },
  rights: { en: "Human rights", bn: "মানবাধিকার" },
  science: { en: "Science", bn: "বিজ্ঞান" },
};
const countryNames = {
  en: new Intl.DisplayNames("en", { type: "region", fallback: "none" }),
  bn: new Intl.DisplayNames("bn", { type: "region", fallback: "none" }),
};
export const countryLabel = (locale: Locale, code: string) => code === "global" ? choose(locale, "Worldwide", "বিশ্বব্যাপী") : countryNames[locale].of(code.toUpperCase()) ?? code;
export const catalogCountries = (stories: { country: string }[]) => [...new Set(["global", ...stories.map(story => story.country)])];
const localized = (max: number) => z.object({ en: z.string().trim().min(2).max(max), bn: z.string().trim().min(2).max(max) }).strict();
export const sourceSchema = z.object({
  name: z.string().trim().min(2).max(160),
  url: z.url({ protocol: /^https$/ }).max(2000),
});
export const observanceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(96),
  date: z.string().refine(isDateKey, "A valid MM-DD date is required."),
  category: z.enum(categories),
  country: z.string().refine(code => code === "global" || (/^[a-z]{2}$/.test(code) && code !== "zz" && !!countryNames.en.of(code.toUpperCase())), "Use global or a two-letter country code."),
  image: z.enum(images),
  title: localized(160),
  summary: localized(420),
  history: localized(4000),
  significance: localized(4000),
  fact: localized(4000),
  participate: localized(4000),
  sources: z.array(sourceSchema).min(1).max(12),
}).strict();
export type Observance = z.infer<typeof observanceSchema>;
export type Category = Observance["category"];
export type StoryImage = Observance["image"];

export const artwork = {
  earth: { file: "/images/earth.webp", alt: { en: "Earth’s luminous blue horizon seen from orbit", bn: "কক্ষপথ থেকে পৃথিবীর নীল দিগন্ত" } },
  ocean: { file: "/images/ocean.webp", alt: { en: "Sunlight shines through a wave and into the ocean", bn: "ঢেউ ভেদ করে সমুদ্রের ভেতর পড়ছে সূর্যের আলো" } },
  library: { file: "/images/library.webp", alt: { en: "Sunlight falls on open books beside a library window", bn: "গ্রন্থাগারের জানালার পাশে খোলা বইয়ে সূর্যের আলো" } },
  forest: { file: "/images/forest.webp", alt: { en: "A fern unfurls on a misty forest floor", bn: "কুয়াশাচ্ছন্ন বনে ফার্নের পাতা মেলে ধরছে" } },
};
