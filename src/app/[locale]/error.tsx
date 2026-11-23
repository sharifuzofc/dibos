"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const bn = usePathname()?.startsWith("/bn");
  return <section className="wrap message-page"><h1>{bn ? "পাতাটি খোলা যায়নি" : "This page couldn’t load"}</h1><Button onClick={reset}>{bn ? "আবার চেষ্টা করুন" : "Try again"}</Button><Link className="inline-link" href={bn ? "/bn" : "/en"}>{bn ? "প্রচ্ছদে ফিরুন" : "Back to home"}</Link></section>;
}