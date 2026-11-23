import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Script from "next/script";
import "@fontsource-variable/manrope";
import "@fontsource-variable/outfit";
import "../globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { choose, isLocale, locales } from "@/lib/calendar";
import { getObservances } from "@/lib/repository";

export const metadata = { icons: { icon: "/icon.svg" } };
export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const stories = await getObservances();
  const search = stories.map(({ slug, date, title, summary, category, country }) => ({ slug, date, title, summary, category, country }));
  return <html lang={locale} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('everyday-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }}/></head>
    <body>
      <a className="skip-link" href="#main">{choose(locale, "Skip to content", "মূল অংশে যান")}</a>
      <Header locale={locale} stories={search}/>
      <main id="main">{children}</main>
      <Footer locale={locale}/>
      {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true" && <Script src="/_vercel/insights/script.js" strategy="afterInteractive"/>}
    </body>
  </html>;
}
