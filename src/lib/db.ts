import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globals = globalThis as typeof globalThis & { everydayDb?: PrismaClient };

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  globals.everydayDb ??= new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 3, connectionTimeoutMillis: 5000 }) });
  return globals.everydayDb;
}
