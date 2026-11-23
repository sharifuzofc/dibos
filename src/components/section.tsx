import type { ReactNode } from "react";

export function SectionHeading({ label, title, description, action }: { label: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow">{label}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{action}</div>;
}