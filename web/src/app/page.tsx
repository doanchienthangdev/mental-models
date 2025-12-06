import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchModels, type ModelRecord } from "@/lib/models";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { BookOpen, Headphones, PlusCircle, RefreshCw } from "lucide-react";
import { HeroGlobe } from "@/components/hero-globe";

export const revalidate = 0;

export default async function HomePage() {
  const [{ data: allModels }, categories, tags] = await Promise.all([
    fetchModels({ status: "published" }),
    listCategories(),
    listTags(),
  ]);
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));
  const catMap = new Map(categories.map((c) => [c.slug, c.name]));
  const tagPalette = [
    "bg-emerald-600/20 text-emerald-200 border-emerald-500/30",
    "bg-sky-600/20 text-sky-200 border-sky-500/30",
    "bg-purple-600/20 text-purple-200 border-purple-500/30",
    "bg-rose-600/20 text-rose-200 border-rose-500/30",
    "bg-amber-500/20 text-amber-200 border-amber-400/30",
  ];
  const celebImages = Array.from({ length: 9 }, (_, idx) => `/images/celebs/${idx + 1}.jpg`);
  const primary3d =
    "rounded-[8px] bg-[#0b5c8a] px-8 text-white text-base font-semibold h-12 transition hover:bg-[#0a537b] w-full sm:w-auto";
  const outline3d =
    "rounded-[8px] border border-[#39566c] bg-transparent px-8 text-base font-semibold text-slate-200 h-12 hover:border-[#0f76b0]/80 hover:text-white w-full sm:w-auto";
  const featuredModels = allModels.slice(0, 6);
  const categorySections = categories
    .map((category) => {
      const categoryModels = allModels.filter((model) => model.category === category.slug);
      return {
        category,
        models: categoryModels.slice(0, 3),
        total: categoryModels.length,
      };
    })
    .filter((section) => section.total > 0);

  const renderModelCard = (model: ModelRecord) => {
    const summary = truncateWords(model.summary ?? "", 20);
    const tagNames = (model.tags ?? []).map((id) => tagMap.get(id) || id);
    const categoryName = model.category ? catMap.get(model.category) || model.category : "General";
    const label = statusLabel(model.audio_status);
    return (
      <Link
        key={model.slug}
        href={`/models/${model.slug}`}
        className="group block overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(46,160,225,0.25)]"
      >
        <div className="relative h-[180px] w-full bg-[#0c1622]">
          {model.cover_url ? (
            <Image src={model.cover_url} alt={model.title} fill className="object-cover" sizes="(min-width: 1024px) 320px, 100vw" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900/60" />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            {model.audio_status && (
              <Badge variant={label.variant} className="bg-[#0f202d]/90">
                {label.label}
              </Badge>
            )}
          </div>
          <div className="absolute right-3 top-3">
            {model.status && (
              <Badge variant="outline" className="bg-[#0f202d]/90 text-slate-100">
                {model.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-3 px-4 pb-8 pt-4">
          <h3 className="font-display text-lg font-semibold text-white group-hover:text-accent">{model.title}</h3>
          <p className="text-sm text-slate-300">{summary}</p>
          <div className="flex flex-wrap gap-2">
            {tagNames.map((tag, idx) => (
              <Badge key={`${tag}-${idx}`} variant="outline" className={cn(tagPalette[idx % tagPalette.length])}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{categoryName}</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>{model.read_time ? `${model.read_time} min read` : "—"}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="relative overflow-hidden bg-[#050f1a] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,160,225,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(76,255,205,0.2),transparent_35%),radial-gradient(circle_at_50%_70%,rgba(46,160,225,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_40%,rgba(255,255,255,0.05)_100%)] mix-blend-soft-light" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 pb-12 pt-7 relative">
        <section className="grid items-center gap-5 py-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <div className="h-1 w-14 rounded-full bg-accent shadow-[0_0_30px_rgba(46,160,225,0.7)]" />
            <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)]">
              Curate the mental models that make you think better.
            </h1>
            <p className="text-lg text-slate-200">
              A personal library to structure your thoughts, discover new frameworks, and improve your decision-making process.
            </p>
            <div className="flex flex-wrap gap-3 w-full flex-col sm:flex-row">
              <Button asChild className={`${primary3d} w-full sm:w-auto`}>
                <Link href="/library" className="whitespace-nowrap">
                  Browse{"\u00A0"}Library
                </Link>
              </Button>
              <Button asChild className={`${outline3d} w-full sm:w-auto`}>
                <Link href="/#how-it-works" className="whitespace-nowrap">
                  How It Works
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(46,160,225,0.22),transparent_45%),radial-gradient(circle_at_40%_60%,rgba(76,255,205,0.15),transparent_40%)] blur-3xl" />
            <HeroGlobe />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-white">Featured Models</h2>
            <Link href="/library" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featuredModels.map(renderModelCard)}</div>
        </section>

        {categorySections.length > 0 && (
          <div className="space-y-16 mt-16">
            {categorySections.map(({ category, models, total }) => (
              <section key={category.slug} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-white">
                    {category.name ?? category.slug} ({total})
                  </h2>
                  <Link href={`/library?category=${category.slug}`} className="text-sm text-accent hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {models.map((model) => renderModelCard(model))}
                </div>
              </section>
            ))}
          </div>
        )}



        <section className="mt-20 space-y-4 text-center">
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">The Genius Thinking Framework</h1>
          <div className="relative mx-auto max-w-3xl px-8 py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(46,160,225,0.25),transparent_85%)] blur-[90px]" />
            <svg
              aria-hidden="true"
              className="absolute left-[-40px] top-1 h-16 w-16 text-white/10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9.5 5.75c-2.07 0-3.75 1.68-3.75 3.75v.25H11v8.5H4V9.5C4 6.19 6.69 3.5 10 3.5h.25v2.25H9.5Zm9 0c-2.07 0-3.75 1.68-3.75 3.75v.25H20v8.5h-7V9.5C13 6.19 15.69 3.5 19 3.5h.25v2.25h-.75Z" />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute right-[-40px] bottom-6 h-16 w-16 rotate-180 text-white/10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9.5 5.75c-2.07 0-3.75 1.68-3.75 3.75v.25H11v8.5H4V9.5C4 6.19 6.69 3.5 10 3.5h.25v2.25H9.5Zm9 0c-2.07 0-3.75 1.68-3.75 3.75v.25H20v8.5h-7V9.5C13 6.19 15.69 3.5 19 3.5h.25v2.25h-.75Z" />
            </svg>
            <p className="relative -mt-8 text-lg text-slate-100">
              I think it is undeniably true that the human brain must work in mental models. The trick is to have your brain work
              better than the other person’s brain because it understands the most fundamental models—ones that will do most work per
              unit.
            </p>
            <p className="mt-4 text-sm font-semibold italic text-slate-300">-- Charlie Munger --</p>
          </div>
        </section>


        <section className="mt-20 space-y-4 text-center">
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">Who Use Mental Model Thinking</h1>
          <div className="relative overflow-hidden rounded-3xl px-4 py-8 mask-edge">
            <div className="w-max animate-marquee-slow flex gap-4">
              {[0, 1].map((loop) => (
                <div key={loop} className="flex gap-4">
                  {celebImages.map((src, idx) => (
                    <div key={`${loop}-${idx}`} className="relative h-[240px] w-[240px] shrink-0 overflow-hidden rounded-2xl">
                      <Image src={src} alt="Famous thinker" fill className="object-cover" sizes="(min-width: 1024px) 280px, 80vw" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mt-20 mb-6 space-y-6">
          <h1 className="text-center font-display text-3xl font-semibold text-white md:text-4xl mb-10">How It Works</h1>
          <div className="grid gap-4 md:grid-cols-4">
            {howItWorks.map((item, idx) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-[#1e3442]/80 bg-[#0f202d]/35 p-8 text-center shadow-[0_16px_50px_rgba(0,0,0,0.3)] transition duration-500 ease-out hover:bg-[#162e41]/80 hover:shadow-[0_28px_80px_rgba(46,160,225,0.25)] hover:border-accent/60"
              >
                <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_50%_10%,rgba(46,160,225,0.08),transparent_55%)]" />
                <div className="relative mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-accent/30 shadow-[0_0_20px_rgba(46,160,225,0.35)]" />
                  <div className="absolute inset-3 rounded-full border border-accent/20" />
                  <div className="relative z-10 flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full bg-[#0d1f2e]/80 text-accent drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-5 text-center text-sm text-slate-400">{item.desc}</p>
                {idx < howItWorks.length - 1 && (
                  <div className="absolute right-[-12px] top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-transparent via-accent/40 to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="benefits" className="mt-20 space-y-6">
          <h1 className="text-center font-display text-3xl font-semibold text-white md:text-4xl mb-4">Unlock Clearer Thinking</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
              >
                <h3 className="font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 px-6 py-8 shadow-[0_18px_60px_rgba(46,160,225,0.25)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-semibold text-white">Start building your personal knowledge hub.</h3>
              <p className="text-sm text-slate-400">Add your own insights and frameworks to the collection.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className={primary3d}>
                <Link href="/create">Create a Model</Link>
              </Button>
              <Button asChild className={outline3d}>
                <Link href="/library">View Library</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const howItWorks = [
  {
    title: "1. Browse & Discover",
    desc: "Explore a cross-disciplinary library of timeless mental models and gather the frameworks top thinkers use to decode complex problems.",
    icon: <BookOpen className="h-8 w-8" />,
  },
  {
    title: "2. Listen & Learn",
    desc: "Generate lifelike AI audio summaries so you can absorb difficult ideas while commuting, walking, or multitasking without losing focus.",
    icon: <Headphones className="h-8 w-8" />,
  },
  {
    title: "3. Create & Curate",
    desc: "Document your own thinking with the Markdown editor, add tags, and pair each model with cover art to keep your insights polished.",
    icon: <PlusCircle className="h-8 w-8" />,
  },
  {
    title: "4. Apply & Refine",
    desc: "Log how each framework influences real decisions, note what works, and refine your personal playbook for sharper strategic thinking.",
    icon: <RefreshCw className="h-8 w-8" />,
  },
];

const benefits = [
  {
    title: "Decision Clarity",
    desc: "Navigate complexity with proven frameworks for better outcomes.",
  },
  {
    title: "Structured Knowledge",
    desc: "Organize insights with tags, TOC, and clean typography.",
  },
  {
    title: "Audio-First Consumption",
    desc: "Learn anywhere with audio-ready summaries for every model.",
  },
  {
    title: "Creative Problem-Solving",
    desc: "Apply diverse models to challenging problems confidently.",
  },
];

const statusLabel = (status: string | null) => {
  switch (status) {
    case "ready":
      return { label: "Audio Ready", variant: "success" as const };
    case "generating":
      return { label: "Audio Pending", variant: "outline" as const };
    default:
      return { label: "Audio Pending", variant: "outline" as const };
  }
};

function truncateWords(text: string, limit: number) {
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}
