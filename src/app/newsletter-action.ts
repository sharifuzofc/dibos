"use server";

import { z } from "zod";
import { isLocale, type Locale } from "@/lib/calendar";
import { getDb } from "@/lib/db";

export async function subscribe(locale: Locale, _previous: { status: string }, form: FormData) {
  const email = z.email().max(254).safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!email.success || !isLocale(locale)) return { status: "invalid" };
  const db = getDb();
  if (!db) return { status: "unavailable" };
  try {
    await db.subscriber.upsert({ where: { email: email.data }, create: { email: email.data, locale }, update: {} });
    return { status: "success" };
  } catch {
    return { status: "error" };
  }
}