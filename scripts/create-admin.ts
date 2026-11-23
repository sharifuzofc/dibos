import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hashPassword } from "../src/lib/password.ts";

async function main() {
  const email = z.email().max(254).parse(process.argv[2]?.trim().toLowerCase());
  const password = z.string().min(16).max(256).parse(process.env.EVERYDAY_ADMIN_PASSWORD);
  const connectionString = z.url().parse(process.env.DATABASE_URL);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await db.admin.create({ data: { email, passwordHash: await hashPassword(password) } });
    console.log("Administrator created.");
  } finally { await db.$disconnect(); }
}
main().catch(error => {
  console.error("Could not create administrator:", error instanceof Error ? error.name : "Unknown error");
  process.exitCode = 1;
});