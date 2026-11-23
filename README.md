# EveryDay

EveryDay is a bilingual calendar of verified observances and short editorial discoveries. The English and Bengali calendars cover all 366 possible month-and-day combinations, including February 29. The starter catalog includes recurring fixed-date observances from international organizations and national institutions. The calendar year controls weekday alignment and leap-day availability.

## Start locally

Use Node.js 22.12 or later. The commands below use the Windows command shim. On other platforms, replace `npm.cmd` and `npx.cmd` with `npm` and `npx`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). Public browsing works immediately with the source-controlled catalog. PostgreSQL enables the editorial dashboard and newsletter signup storage.

## PostgreSQL and the editor

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL connection string. Use the provider's TLS connection settings for hosted databases. Set the same database configuration before building and starting the site.
2. Run `npm.cmd run db:deploy` to apply the checked-in migration.
3. Set `EVERYDAY_ADMIN_PASSWORD` in the shell environment to a strong password of at least 16 characters, run `npm.cmd run db:create-admin -- admin@example.com`, then remove the password from the shell environment. The database stores a salted password hash.
4. Open `/admin` and sign in. The new-draft template uses the same Zod-validated fields as the starter content. Complete both translations and include the official sources.
5. Save the draft, check the source for the date and recognition, review the editorial claims and translations, then confirm verification and publish. Unpublish from the same dashboard to return the record to draft.

The bundled stories in `src/lib/seed.ts` are maintained through source control. PostgreSQL stores separately authored drafts, published stories, verification and publication timestamps, admin sessions, and opt-in email addresses. Newsletter email delivery needs a provider and is outside the current local setup.

## Source review and artwork

- Check [the United Nations calendar](https://www.un.org/en/observances/list-days-weeks) and follow the official organizer, institution, or national government reference for the observance. Verify the placement on the calendar, the name and recognition, each factual claim, and the Bengali translation.
- Include HTTPS source URLs. Keep the date field in `MM-DD` format. Supply original writing for the history, significance, fact and participation fields. Calendar dates without a published story display a rotating set of Daily Discovery activities and nearby observances.
- The four local WebP illustrations were created for EveryDay with the built-in image generation tool. Their prompts and use are recorded in [ARTWORK.md](ARTWORK.md). Observance articles identify these visuals as generated illustrations.
- Run `npm.cmd run content:check` after changes to validate the records and verify the artwork paths.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Set `PLAYWRIGHT_CHANNEL=msedge` to test with an installed Microsoft Edge instead. The tests start the production build on loopback. Set `PLAYWRIGHT_PORT` to use a different free port. The optional editorial tests require a disposable database, a build configured with its `DATABASE_URL`, and `PLAYWRIGHT_ADMIN_EMAIL` and `PLAYWRIGHT_ADMIN_PASSWORD`. Those tests write drafts and subscriptions, so use an isolated database.

## Deployment preparation

- Import the project into Vercel as a Next.js application and use a supported Node.js runtime. Set `SITE_URL` to the canonical HTTPS origin, `SITE_TIME_ZONE` to the time zone for the daily feature, and configure `DATABASE_URL` for both build and runtime. Use the host's pooled database URL for runtime when available and its direct connection for migration where required.
- Apply the migration before launch and provision the administrator separately. Configure the custom domain and verify HTTPS in the hosting dashboard.
- Confirm the canonical origin and localized page URLs, then set `SITE_INDEXABLE=true` for the public production environment. Set `GOOGLE_SITE_VERIFICATION` if using HTML tag verification, and submit `/sitemap.xml` in Google Search Console after ownership verification.
- To enable optional Vercel Analytics, enable it on the Vercel project and set `NEXT_PUBLIC_VERCEL_ANALYTICS=true`. Any other analytics platform can be integrated once selected.
- Check live accessibility, page performance and Core Web Vitals after deployment using production traffic and hosting conditions.
