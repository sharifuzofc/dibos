"use client";

import { Mail } from "lucide-react";
import { useActionState } from "react";
import { choose, type Locale } from "@/lib/calendar";
import { subscribe } from "@/app/newsletter-action";
import { Button } from "./ui/button";

export function Newsletter({ locale }: { locale: Locale }) {
  const [state, action, pending] = useActionState(subscribe.bind(null, locale), { status: "idle" });
  const t = (en: string, bn: string) => choose(locale, en, bn);
  const text: Record<string, string> = {
    invalid: t("Enter a valid email address.", "সঠিক ইমেইল ঠিকানা লিখুন।"),
    unavailable: t("Subscriptions are currently unavailable.", "এখন সদস্যতা নেওয়া যাচ্ছে না।"),
    success: t("You’re on the list.", "আপনার নাম তালিকায় যোগ হয়েছে।"),
    error: t("We couldn’t save your email. Please try again.", "ইমেইল সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
  };
  return <section className="glass newsletter">
    <div className="newsletter-icon"><Mail size={25}/></div>
    <div><h2>{t("Stories worth opening.", "পড়ার মতো গল্প।")}</h2><p>{t("Get a selection of observances and stories in your inbox.", "বাছাই করা দিবস ও গল্প ইমেইলে পান।")}</p></div>
    <form action={action}>
      <div className="subscribe-fields"><label><span className="sr-only">{t("Email address", "ইমেইল ঠিকানা")}</span><input name="email" type="email" autoComplete="email" required maxLength={254} placeholder={t("Your email address", "আপনার ইমেইল ঠিকানা")}/></label><Button type="submit" disabled={pending}>{pending ? t("Subscribing…", "সদস্যতা নেওয়া হচ্ছে…") : t("Subscribe", "সদস্য হোন")}</Button></div>
      <p role="status">{text[state.status] ?? ""}</p>
    </form>
  </section>;
}