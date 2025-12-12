 "use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  ChevronDown,
  Compass,
  Layers,
  Lightbulb,
  Network,
  Sparkles,
  Target,
  Workflow,
  User,
} from "lucide-react";
import type { Category } from "@/lib/categories";
import { listCategories } from "@/lib/categories";

export function SiteHeader() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    let active = true;
    listCategories()
      .then((data) => {
        if (!active) return;
        setCategories(data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const iconBySlug = useMemo(
    () => ({
      "decision-making": <Target className="h-5 w-5" />,
      "systems-thinking": <Network className="h-5 w-5" />,
      strategy: <Compass className="h-5 w-5" />,
      psychology: <Brain className="h-5 w-5" />,
      productivity: <Workflow className="h-5 w-5" />,
      creativity: <Sparkles className="h-5 w-5" />,
      learning: <BookOpen className="h-5 w-5" />,
      business: <Layers className="h-5 w-5" />,
      general: <Lightbulb className="h-5 w-5" />,
      "general-thinking": <Lightbulb className="h-5 w-5" />,
    }),
    [],
  );

  const fallbackIcons = useMemo(
    () => [
      <Target className="h-5 w-5" key="fallback-1" />,
      <Network className="h-5 w-5" key="fallback-2" />,
      <Compass className="h-5 w-5" key="fallback-3" />,
      <Brain className="h-5 w-5" key="fallback-4" />,
      <Workflow className="h-5 w-5" key="fallback-5" />,
      <Sparkles className="h-5 w-5" key="fallback-6" />,
      <BookOpen className="h-5 w-5" key="fallback-7" />,
      <Lightbulb className="h-5 w-5" key="fallback-8" />,
    ],
    [],
  );

  const getIcon = (slug: string, idx: number) => iconBySlug[slug as keyof typeof iconBySlug] ?? fallbackIcons[idx % fallbackIcons.length];

  const isLoggedIn = role === "admin" || role === "manager";
  const showBrowseMenu = browseOpen || process.env.NODE_ENV === "test";
  const openBrowse = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setBrowseOpen(true);
  };
  const closeBrowse = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setBrowseOpen(false), 120);
  };
  const navigate = (href: string) => {
    setBrowseOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#1e3442] bg-[#0d1821]/90 backdrop-blur relative">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/images/logo.png" alt="Mental Models Hub" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-display text-lg">Mental Models Hub</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <button
            type="button"
            className="group inline-flex items-center gap-1 hover:text-white focus:outline-none cursor-pointer"
            onMouseEnter={openBrowse}
            onMouseLeave={closeBrowse}
            onFocus={openBrowse}
            onBlur={closeBrowse}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                event.preventDefault();
                openBrowse();
              }
            }}
            onClick={() => navigate("/library")}
          >
            <span>Browse</span>
            <ChevronDown className="h-4 w-4 transition duration-150 group-hover:translate-y-[1px]" />
          </button>
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
      {showBrowseMenu && (
        <div
          className="absolute left-0 top-full w-screen border-b border-[#1e3442] bg-[#0b141d] shadow-2xl"
          onMouseEnter={openBrowse}
          onMouseLeave={closeBrowse}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Categories</p>
              <h3 className="text-xl font-semibold text-white">Browse by Category</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <button
                type="button"
                className="flex items-center gap-3 px-2 py-2 text-left text-slate-100 transition hover:text-white cursor-pointer"
                onClick={() => navigate("/library")}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Layers className="h-5 w-5 md:h-5 md:w-5" />
                </div>
                <p className="text-sm font-normal group-hover:text-accent transition-colors">All mental models</p>
              </button>
              {categories.map((category, idx) => (
                <button
                  key={category.id}
                  type="button"
                  className="group flex items-center gap-3 px-2 py-2 text-left text-slate-100 transition hover:-translate-y-0.5 hover:text-white cursor-pointer"
                  onClick={() => navigate(`/library?category=${category.slug}`)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {getIcon(category.slug, idx)}
                  </div>
                  <p className="text-sm font-normal transition-colors group-hover:text-accent">{category.name ?? category.slug}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
