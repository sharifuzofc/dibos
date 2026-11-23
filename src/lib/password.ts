import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const pattern = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt, 64) as Buffer;
  return "scrypt:" + salt + ":" + hash.toString("hex");
}
export async function verifyPassword(password: string, stored: string) {
  const match = pattern.exec(stored);
  const hash = await derive(password, match?.[1] ?? "00000000000000000000000000000000", 64) as Buffer;
  const actual = Buffer.from(match?.[2] ?? "00".repeat(64), "hex");
  return timingSafeEqual(hash, actual) && !!match;
}