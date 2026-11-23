import { expect, test } from "@playwright/test";
import { seed } from "../../src/lib/seed";

const email = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test("administrator can verify, publish and unpublish a draft", async ({ page, request }, info) => {
  test.skip(info.project.name !== "desktop" || !email || !password, "Requires a disposable PostgreSQL database and administrator.");
  const slug = "qa-observance-" + Date.now();
  const draft = { ...seed.find(story => story.slug === "world-oceans-day")!, slug };
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByText("New draft")).toHaveCount(0);
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  const session = (await page.context().cookies()).find(cookie => cookie.name === "everyday_admin");
  expect(session).toMatchObject({ httpOnly: true, secure: true, sameSite: "Strict", path: "/admin" });
  await page.getByText("New draft", { exact: true }).click();
  await page.getByLabel("Story JSON").fill(JSON.stringify(draft));
  await page.getByRole("button", { name: "Create draft" }).click();
  await page.getByText(slug + " · Draft", { exact: true }).click();
  const publicPath = "/en/observance/" + slug;
  await expect(page.getByRole("button", { name: "Publish", exact: true })).toBeVisible();
  expect((await request.get(publicPath)).status()).toBe(404);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Confirm the date" })).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText(slug + " · Published", { exact: true })).toBeVisible();
  expect((await request.get(publicPath)).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(publicPath);
  await page.getByRole("button", { name: "Unpublish", exact: true }).click();
  await expect(page.getByText(slug + " · Draft", { exact: true })).toBeVisible();
  expect((await request.get(publicPath)).status()).toBe(404);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
});

test("newsletter accepts an email and handles duplicate signups", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop" || !email, "Requires a disposable PostgreSQL database.");
  await page.goto("/en");
  const address = "qa-newsletter-" + Date.now() + "@example.com";
  for (const value of [address, address.toUpperCase()]) {
    await page.getByRole("textbox", { name: "Email address" }).fill(value);
    await page.getByRole("button", { name: "Subscribe", exact: true }).click();
    await expect(page.getByText("You’re on the list.", { exact: true })).toBeVisible();
  }
});