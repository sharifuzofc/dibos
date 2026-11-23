"use client";

import { useActionState } from "react";
import { login, saveStory } from "@/app/admin/actions";
import { Button } from "./ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { status: "" });
  return <form className="glass admin-form" action={action}>
    <label>Email<input className="form-control" name="email" type="email" autoComplete="username" required maxLength={254}/></label>
    <label>Password<input className="form-control" name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>
    <div><Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button></div>
    <p role="status">{state.status}</p>
  </form>;
}
export function StoryForm({ payload, slug, revision, published = false }: { payload: string; slug?: string; revision?: string; published?: boolean }) {
  const [state, action, pending] = useActionState(saveStory, { status: "" });
  return <form className="admin-form" action={action}>
    <input name="originalSlug" type="hidden" value={slug ?? ""}/><input name="revision" type="hidden" value={revision ?? ""}/>
    <label>Story JSON<textarea spellCheck={false} className="form-control" name="payload" defaultValue={payload} readOnly={published} required maxLength={64000}/></label>
    {slug && !published && <label className="checkbox"><input name="verified" type="checkbox"/>I checked the date, recognition, source links and both translations.</label>}
    <div className="admin-actions">
      {!slug && <Button name="intent" value="create" type="submit" disabled={pending}>Create draft</Button>}
      {slug && !published && <><Button name="intent" value="save" type="submit" disabled={pending} variant="outline">Save draft</Button><Button name="intent" value="publish" type="submit" disabled={pending}>Publish</Button></>}
      {published && <Button name="intent" value="unpublish" type="submit" disabled={pending} variant="outline">Unpublish</Button>}
    </div>
    <p role="status">{pending ? "Saving…" : state.status}</p>
  </form>;
}