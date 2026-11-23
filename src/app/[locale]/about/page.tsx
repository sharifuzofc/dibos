import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/editorial";
import { choose, isLocale } from "@/lib/calendar";
import { localizedMetadata, siteDescription } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? localizedMetadata(locale, "/about", choose(locale, "About EveryDay", "EveryDay পরিচিতি"), siteDescription(locale)) : {};
}
export default async function About({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const title = t("About EveryDay", "EveryDay পরিচিতি");
  return <div className="wrap subpage"><Breadcrumbs locale={locale} items={[{ label: title, href: "/" + locale + "/about" }]}/>
    <div className="page-heading"><h1>{title}</h1><p>{siteDescription(locale)}</p></div>
    <div className="editorial">
      <section><h2>{t("What we verify", "আমরা যা যাচাই করি")}</h2><p>{t("An observance must have a reliable source for its date and recognition. Each story links to the relevant organizer, international institution or government. The catalog is selective and currently focuses on fixed Gregorian dates.", "দিবসের তারিখ ও স্বীকৃতির জন্য নির্ভরযোগ্য সূত্র থাকতে হয়। প্রতিটি গল্পে সংশ্লিষ্ট আয়োজক, আন্তর্জাতিক প্রতিষ্ঠান বা সরকারের লিংক রয়েছে। এই বাছাই করা তালিকা বর্তমানে গ্রেগরীয় পঞ্জিকার নির্দিষ্ট তারিখে সীমিত।")}</p></section>
      <section><h2>{t("Daily Discoveries", "প্রতিদিনের আবিষ্কার")}</h2><p>{t("Dates without a catalog entry offer a short editorial activity. The Daily Discovery label identifies these prompts, and the illustrations on the site were generated for EveryDay.", "তালিকায় দিবস নেই এমন তারিখে ছোট সম্পাদকীয় কার্যক্রম আছে। ‘আজকের আবিষ্কার’ লেখা দিয়ে এগুলো চেনা যায়, এবং সাইটের চিত্রগুলো EveryDay-এর জন্য তৈরি।")}</p></section>
      <section><h2>{t("Your data", "আপনার তথ্য")}</h2><p>{t("Favorites and theme preferences are saved in your browser. Newsletter subscribers provide an email address and language preference.", "পছন্দের তালিকা ও থিম ব্রাউজারে সংরক্ষিত থাকে। সংবাদপত্রের সদস্যরা ইমেইল ঠিকানা ও ভাষা পছন্দ জানান।")}</p></section>
    </div>
  </div>;
}