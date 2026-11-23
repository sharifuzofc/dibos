import Link from "next/link";
import { currentAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { LoginForm, StoryForm } from "@/components/admin-forms";
import { Button } from "@/components/ui/button";
import { logout } from "./actions";

export const dynamic = "force-dynamic";
const template = {
  slug: "", date: "", category: "culture", country: "global", image: "earth",
  title: { en: "", bn: "" }, summary: { en: "", bn: "" }, history: { en: "", bn: "" },
  significance: { en: "", bn: "" }, fact: { en: "", bn: "" }, participate: { en: "", bn: "" },
  sources: [{ name: "", url: "" }],
};
export default async function AdminPage() {
  let admin = null;
  let rows = null;
  let status = "";
  const db = getDb();
  try {
    admin = db ? await currentAdmin() : null;
    rows = admin && db ? await db.observance.findMany({ orderBy: { updatedAt: "desc" } }) : null;
  } catch { status = "The editorial database could not be reached."; }
  return <>
    <Link className="inline-link" href="/en">EveryDay</Link>
    <div className="page-heading"><h1>Editorial dashboard</h1><p>{status || (db ? (admin ? admin.email : "Sign in to manage observance drafts and publishing.") : "Configure PostgreSQL and create an administrator to begin.")}</p></div>
    {!admin && db && !status && <LoginForm/>}
    {admin && <form action={logout}><Button type="submit" variant="outline">Sign out</Button></form>}
    {rows && <>
      <h2 style={{ marginTop: 20 }}>Observances</h2>
      <div className="admin-list">{rows.map(row => <details className="glass admin-entry" key={row.slug}>
        <summary>{row.slug} · {row.status === "PUBLISHED" ? "Published" : "Draft"}</summary>
        <StoryForm key={row.updatedAt.toISOString()} slug={row.slug} revision={row.updatedAt.toISOString()} payload={JSON.stringify(row.payload, null, 2)} published={row.status === "PUBLISHED"}/>
      </details>)}</div>
      <details className="glass admin-entry"><summary>New draft</summary><StoryForm payload={JSON.stringify(template, null, 2)}/></details>
    </>}
  </>;
}