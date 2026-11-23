import { expect, test } from "@playwright/test";

test("homepage renders and links to a leap-day discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Every Day Has a Story Worth Discovering.");
  await page.getByRole("link", { name: "Explore the calendar" }).click();
  const month = page.getByRole("combobox", { name: "Month", exact: true });
  const year = page.getByRole("combobox", { name: "Year", exact: true });
  await month.selectOption("2");
  await year.selectOption("2027");
  await expect(page.getByRole("link", { name: "February 29", exact: true })).toHaveCount(0);
  await year.selectOption("2028");
  await page.getByRole("link", { name: "February 29", exact: true }).click();
  await expect(page).toHaveURL(/day\/02-29\?year=2028$/);
  await expect(page.getByRole("heading", { name: "February 29", exact: true })).toBeVisible();
  await expect(page.getByText("Daily Discovery", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next date: March 1" })).toHaveAttribute("href", "/en/day/03-01?year=2028");
});
test("instant search opens a sourced story, saves a favorite, switches locale and remembers theme", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("searchbox").fill("ocean");
  await page.getByRole("dialog").getByRole("link", { name: /World Oceans Day/ }).click();
  await expect(page.getByRole("heading", { name: "World Oceans Day", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "United Nations", exact: true })).toHaveAttribute("href", /^https:\/\/www.un.org\//);
  await page.getByRole("button", { name: "Save to favorites" }).first().click();
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: /World Oceans Day/ })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("link", { name: /Read in Bengali/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { name: "বিশ্ব মহাসাগর দিবস", exact: true })).toBeVisible();
});
test("explore combines country, month and text filters", async ({ page }) => {
  await page.goto("/en/explore?country=bd");
  await expect(page.getByRole("heading", { name: "Bangladesh Victory Day" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "World Oceans Day" })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Month", exact: true }).selectOption("3");
  await expect(page.getByRole("heading", { name: "Bangladesh Independence Day" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bangladesh Victory Day" })).toHaveCount(0);
  await page.getByRole("searchbox").fill("unmatched value");
  await expect(page.getByText("No observances match these filters.")).toBeVisible();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("heading", { name: "World Oceans Day" })).toBeVisible();
});
test("server supplies canonical metadata, articles, localized sitemap and invalid-date responses", async ({ page, request }) => {
  await page.goto("/en/observance/world-oceans-day");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", /\/en\/observance\/world-oceans-day$/);
  await expect(page.locator('link[hreflang="bn"]')).toHaveAttribute("href", /\/bn\/observance\/world-oceans-day$/);
  const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structured.map(value => JSON.parse(value)["@type"])).toEqual(["BreadcrumbList", "Article"]);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("/en/day/02-29");
  expect(xml).toContain("/bn/day/12-31");
  expect((xml.match(/<loc>/g) ?? []).length).toBeGreaterThanOrEqual(732);
  expect((await request.get("/en/day/02-30")).status()).toBe(404);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap:");
});
test("homepage fits mobile viewport and serves actual image bytes", async ({ page, request }) => {
  const failedAssets: string[] = [];
  page.on("response", response => { if (response.url().includes("/_next/static/") && !response.ok()) failedAssets.push(response.url()); });
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect((await request.get("/images/earth.webp")).headers()["content-type"]).toContain("image/webp");
  await expect(page.locator(".hero-feature img")).toBeVisible();
  expect(failedAssets).toEqual([]);
});
test("a single date can list multiple independently sourced observances", async ({ page }) => {
  await page.goto("/en/day/02-21");
  await expect(page.getByRole("heading", { name: "International Mother Language Day" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Language Martyrs’ Day in Bangladesh" })).toBeVisible();
});
test("instant search can find a date without a published observance", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("searchbox").fill("February 29");
  await page.getByRole("dialog").getByRole("link", { name: /February 29/ }).click();
  await expect(page).toHaveURL(/\/en\/day\/02-29$/);
});
