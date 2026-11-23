import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/outfit";
import "../globals.css";

export const metadata: Metadata = { title: "EveryDay editorial dashboard", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><main className="wrap subpage">{children}</main></body></html>;
}