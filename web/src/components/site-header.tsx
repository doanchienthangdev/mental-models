 "use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export function SiteHeader() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth/session")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!active) return;
        setRole(typeof data?.role === "string" ? data.role : null);
      })
      .catch(() => {
        if (!active) return;
        setRole(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const isLoggedIn = role === "admin" || role === "manager";

  return (
    <header className="sticky top-0 z-30 border-b border-[#1e3442] bg-[#0d1821]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/images/logo.png" alt="Mental Models Hub" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-display text-lg">Mental Models Hub</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <Link href="/library" className="hover:text-white">
            Library
          </Link>
          <Link href="/#how-it-works" className="hover:text-white">
            How It Works
          </Link>
          <Link href="/#benefits" className="hover:text-white">
            Benefits
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/admin"
                className="rounded-[8px] border border-[#39566c] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#0f76b0]/80 hover:text-white"
              >
                Admin Console
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e3442] bg-[#122534] text-white">
                <User className="h-5 w-5" />
              </div>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-[8px] border border-[#39566c] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#0f76b0]/80 hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
