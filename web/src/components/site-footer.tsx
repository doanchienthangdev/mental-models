import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1e3442] bg-[#0d1821]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Mental Models Hub logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold text-white">Mental Models Hub</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms of Service
          </Link>
        </div>
        <div className="text-xs text-slate-500">© {new Date().getFullYear()} Mental Models Hub. All rights reserved.</div>
      </div>
    </footer>
  );
}
