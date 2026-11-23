import { access } from "node:fs/promises";
import { artwork, observanceSchema } from "../src/lib/content-schema.ts";
import { seed } from "../src/lib/seed.ts";

async function run() {
  const slugs = new Set<string>();
  for (const value of seed) {
    const story = observanceSchema.parse(value);
    if (slugs.has(story.slug)) throw new Error("Duplicate observance: " + story.slug);
    slugs.add(story.slug);
  }
  await Promise.all(Object.values(artwork).map(image => access("public" + image.file)));
  console.log("Validated " + slugs.size + " bilingual observances and local artwork.");
}
run().catch(error => { console.error(error); process.exitCode = 1; });