"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data.role || !["admin", "manager"].includes(data.role)) {
          router.replace("/admin/login");
          return;
        }
        setLoading(false);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1821] text-slate-100">
        <div className="flex h-screen items-center justify-center text-slate-300">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1821] text-slate-100">
      <header className="border-b border-[#1e3442] bg-[#0d1821]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Image src="/images/logo.png" alt="Mental Models Hub" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-display text-lg">Admin Console</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-b-2 border-transparent pb-1 transition hover:text-white",
                    pathname === item.href ? "border-accent text-white" : "",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <UserMenu
              onLogout={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" });
                router.replace("/admin/login");
              }}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-8">{children}</main>
    </div>
  );
}

function UserMenu({ onLogout }: { onLogout: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#122534] text-white border border-[#1e3442]"
      >
        <User className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#1e3442] bg-[#0f202d] p-2 shadow-card">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-[#132836]"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-[#132836]"
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
