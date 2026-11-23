import Link from "next/link";

export default function NotFound() {
  return <section className="wrap message-page"><h1>Page not found</h1><p lang="bn">পাতাটি পাওয়া যায়নি।</p><Link className="inline-link" href="/en">Back to home</Link><Link className="inline-link" href="/bn" lang="bn">প্রচ্ছদে ফিরুন</Link></section>;
}