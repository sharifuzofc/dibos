import Link from "next/link";
import { CalendarDays, CodeXml } from "lucide-react";
import { choose, type Locale } from "@/lib/calendar";
import { buttonVariants } from "./ui/button";

export function Footer({ locale }: { locale: Locale }) {
  const home = "/" + locale;
  return <footer className="site-footer">
    <div className="wrap footer-inner">
      <Link className="brand" href={home}><span className="logo"><CalendarDays size={19}/></span><span>Every<span>Day</span><i>.</i></span></Link>
      <p>{choose(locale, "Every date has a story.", "প্রতিটি তারিখের একটি গল্প আছে।")}</p>
      <nav aria-label={choose(locale, "Footer", "শেষাংশ")}><Link href={home + "#calendar"}>{choose(locale, "Calendar", "পঞ্জিকা")}</Link><Link href={home + "/explore"}>{choose(locale, "All observances", "সব দিবস")}</Link><Link href={home + "/about"}>{choose(locale, "About & sources", "পরিচিতি ও সূত্র")}</Link></nav>
    </div>
    <div className="wrap footer-credit">
      <a className={buttonVariants({ variant: "outline" })} href="https://sharifos.web.app/">
        <CodeXml size={16} aria-hidden="true"/>
        {choose(locale, "Developed by SharifOS", "ডেভেলপ করেছেন SharifOS")}
      </a>
    </div>
  </footer>;
}
