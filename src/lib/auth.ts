import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

const sessionKey = "everyday_admin";
const ttl = 1000 * 60 * 60 * 8;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function currentAdmin() {
  const db = getDb();
  const token = (await cookies()).get(sessionKey)?.value;
  if (!db || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.session.findUnique({ where: { tokenHash: digest(token) }, select: { expiresAt: true, admin: { select: { id: true, email: true } } } });
  return session && session.expiresAt.getTime() > Date.now() ? session.admin : null;
}
export async function startSession(adminId: string) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");
  const jar = await cookies();
  const token = randomBytes(32).toString("hex");
  const oldToken = jar.get(sessionKey)?.value;
  const expiresAt = new Date(Date.now() + ttl);
  await db.$transaction([
    db.session.deleteMany({ where: { OR: [{ expiresAt: { lte: new Date() } }, ...(oldToken ? [{ tokenHash: digest(oldToken) }] : [])] } }),
    db.session.create({ data: { tokenHash: digest(token), adminId, expiresAt } }),
  ]);
  jar.set(sessionKey, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", expires: expiresAt });
}
export async function endSession() {
  const db = getDb();
  const jar = await cookies();
  const token = jar.get(sessionKey)?.value;
  if (token && db) await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.set(sessionKey, "", { path: "/admin", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
}
export async function takeLoginAttempt() {
  const db = getDb();
  if (!db) return false;
  const now = new Date();
  const until = new Date(now.getTime() + 15 * 60 * 1000);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "LoginAttempt" ("key", "count", "expiresAt")
    VALUES ('admin-login', 1, ${until})
    ON CONFLICT ("key") DO UPDATE
    SET "count" = CASE WHEN "LoginAttempt"."expiresAt" <= ${now} THEN 1 ELSE LEAST("LoginAttempt"."count" + 1, 26) END,
        "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" <= ${now} THEN ${until} ELSE "LoginAttempt"."expiresAt" END
    RETURNING "count"
  `;
  return rows[0]?.count <= 25;
}