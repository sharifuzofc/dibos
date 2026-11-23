import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { getDb } from "./db";
import { observanceSchema, type Observance } from "./content-schema";
import { seed } from "./seed";

export const publishedCatalogTag = "everyday-published-catalog";
const publishedRows = unstable_cache(async () => {
  const db = getDb();
  if (!db) return [];
  return db.observance.findMany({
    where: { status: "PUBLISHED", verifiedAt: { not: null } },
    select: { slug: true, payload: true },
  });
}, [publishedCatalogTag, process.env.SITE_URL ?? "local"], { tags: [publishedCatalogTag], revalidate: 300 });

export const getObservances = cache(async (): Promise<Observance[]> => {
  if (!process.env.DATABASE_URL) return seed;
  await connection();
  try {
    const rows = await publishedRows();
    const stories = new Map(seed.map(item => [item.slug, item]));
    for (const row of rows) {
      const parsed = observanceSchema.safeParse(row.payload);
      if (parsed.success && parsed.data.slug === row.slug) stories.set(row.slug, parsed.data);
    }
    return [...stories.values()].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
  } catch (error) {
    console.error("Published catalog query failed", error instanceof Error ? error.name : "Unknown error");
    return seed;
  }
});
