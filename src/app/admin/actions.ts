"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { currentAdmin, endSession, startSession, takeLoginAttempt } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { observanceSchema } from "@/lib/content-schema";
import { verifyPassword } from "@/lib/password";
import { publishedCatalogTag } from "@/lib/repository";
import { seed } from "@/lib/seed";

const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) });
type Status = { status: string };

export async function login(_previous: Status, form: FormData): Promise<Status> {
  const input = credentials.safeParse({ email: String(form.get("email") ?? "").trim().toLowerCase(), password: form.get("password") });
  if (!input.success) return { status: "Check your email and password." };
  const db = getDb();
  if (!db) return { status: "Administrator access is unavailable." };
  try {
    if (!await takeLoginAttempt()) return { status: "Too many attempts. Try again in 15 minutes." };
    const admin = await db.admin.findUnique({ where: { email: input.data.email } });
    const valid = await verifyPassword(input.data.password, admin?.passwordHash ?? "");
    if (!valid || !admin) return { status: "Check your email and password." };
    await startSession(admin.id);
  } catch {
    return { status: "Administrator access is temporarily unavailable." };
  }
  redirect("/admin");
}
export async function logout() {
  await endSession();
  redirect("/admin");
}
export async function saveStory(_previous: Status, form: FormData): Promise<Status> {
  const db = getDb();
  if (!db || !await currentAdmin()) return { status: "Sign in again to edit content." };
  const intent = z.enum(["create", "save", "publish", "unpublish"]).safeParse(form.get("intent"));
  if (!intent.success) return { status: "Choose an editorial action." };
  let payload: unknown;
  try {
    const raw = String(form.get("payload") ?? "");
    if (raw.length > 64000) return { status: "Story data exceeds 64,000 characters." };
    payload = JSON.parse(raw);
  } catch { return { status: "Enter valid JSON." }; }
  const parsed = observanceSchema.safeParse(payload);
  if (!parsed.success) return { status: parsed.error.issues.slice(0, 5).map(issue => issue.path.join(".") + " — " + issue.message).join(" · ") };
  const story = parsed.data;
  if (seed.some(item => item.slug === story.slug)) return { status: "Choose a new slug. Built-in stories are maintained in source control." };

  const slug = form.get("originalSlug");
  const revision = z.iso.datetime().safeParse(form.get("revision"));
  const publish = intent.data === "publish";
  if (publish && form.get("verified") !== "on") return { status: "Confirm the date, recognition and sources before publishing." };
  try {
    if (intent.data === "create") {
      await db.observance.create({ data: { slug: story.slug, payload: story } });
    } else {
      if (slug !== story.slug || !revision.success) return { status: "Refresh the editor. Existing slugs are permanent." };
      const unpublish = intent.data === "unpublish";
      const now = new Date();
      const edited = await db.observance.updateMany({
        where: { slug: story.slug, updatedAt: new Date(revision.data), status: unpublish ? "PUBLISHED" : "DRAFT" },
        data: {
          ...(unpublish ? {} : { payload: story }),
          status: publish ? "PUBLISHED" : "DRAFT",
          publishedAt: publish ? now : null,
          verifiedAt: publish ? now : null,
          updatedAt: now,
        },
      });
      if (!edited.count) return { status: "This story changed. Refresh the editor and try again." };
    }
  } catch (error) {
    return { status: typeof error === "object" && error !== null && "code" in error && error.code === "P2002" ? "That slug is already in use." : "The change couldn’t be saved." };
  }
  revalidatePath("/admin");
  if (publish || intent.data === "unpublish") updateTag(publishedCatalogTag);
  return { status: publish ? "Published." : intent.data === "unpublish" ? "Unpublished and returned to drafts." : "Draft saved." };
}
