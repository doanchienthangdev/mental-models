import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GithubSlugger from "github-slugger";
import { fetchModelBySlug } from "@/lib/models";
import { supabase } from "@/lib/supabase/client";
import { ModelAudioPlayer } from "@/components/model-audio-player";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { TableOfContent } from "@/components/table-of-content";
import { TableWidthSync } from "@/components/table-width-sync";
import type { Database } from "@/lib/supabase/types";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

type AudioAssetRow = Database["public"]["Tables"]["audio_assets"]["Row"];

const tagPalette = [
  "border-[#1d4f7a] bg-[#0f2740] text-[#6ec4ff]",
  "border-[#1d5c5a] bg-[#0d2c2b] text-[#5de6c2]",
  "border-[#5c3575] bg-[#281033] text-[#d7a7ff]",
  "border-[#5f3c2e] bg-[#2b130a] text-[#f5b48c]",
  "border-[#5d2d3a] bg-[#2b0d17] text-[#ff8ab3]",
];

const markdownComponents: Components = {
  table: ({ className, ...props }) => (
    <div className="table-wrapper" data-markdown="block">
      <table {...props} className={cn(className)} />
    </div>
  ),
};

const buildToc = (body?: string | null) => {
  if (!body) return [];
  const matches = body.match(/^#{2,3}\s.+$/gm) ?? [];
  const slugger = new GithubSlugger();
  return matches.map((heading) => {
    const text = heading.replace(/^#{2,3}\s/, "");
    const level = heading.match(/^#+/)?.[0].length ?? 2;
    return {
      id: slugger.slug(text),
      label: text,
      level,
    };
  });
};

export const revalidate = 0;

export default async function ModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await fetchModelBySlug(slug).catch(() => null);
  if (!model) {
    notFound();
  }
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);
  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.name]));
  const categoryLabel = model.category ? categoryMap.get(model.category) ?? model.category : "General";
  const tagMap = new Map(tags.map((tag) => [tag.id, tag.name]));
  const { data: audioAsset } = await supabase
    .from("audio_assets")
    .select("*")
    .eq("model_id", model.id)
    .eq("is_primary", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<AudioAssetRow>();
  const toc = buildToc(model.body);
  const relatedModelsQuery = model.category
    ? await supabase
        .from("models")
        .select("id,title,slug,cover_url,updated_at")
        .eq("category", model.category)
        .neq("id", model.id)
        .order("updated_at", { ascending: false })
        .limit(5)
    : { data: [], error: null };
  const relatedModels =
    (relatedModelsQuery.data as Array<{
      id: string;
      title: string;
      slug: string;
      cover_url: string | null;
      updated_at: string | null;
    }>) ?? [];
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 pb-16 pt-10 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-10 space-y-3 rounded-2xl bg-[#0f202d] p-4 text-sm text-slate-200 shadow-card">
          <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Table of content</div>
          <TableOfContent items={toc} />
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <nav className="inline-flex items-center gap-2 text-sm text-slate-400">
          <Link href="/library" className="inline-flex items-center gap-1 transition hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Library
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-500" />
          {model.category ? (
            <Link href={`/library?category=${model.category}`} className="text-accent hover:underline">
              {categoryLabel}
            </Link>
          ) : (
            <span className="text-slate-400">All Models</span>
          )}
        </nav>

        <header className="space-y-2">
          <p className="text-sm text-slate-400">
            {model.read_time ? `${model.read_time} min read` : "—"} • Updated {new Date(model.updated_at).toLocaleDateString()}
          </p>
          <h1 className="font-display text-4xl font-semibold text-white">{model.title}</h1>
          {(model.summary ?? "").trim() && <p className="text-base text-slate-400 mt-3">{model.summary}</p>}
        </header>

        {(audioAsset?.audio_url ?? model.audio_url) && (
          <div className="sticky z-30 [top:calc(var(--topbar-height,64px)+16px)]">
            <ModelAudioPlayer
              audioUrl={audioAsset?.audio_url ?? model.audio_url}
              status={audioAsset?.status ?? model.audio_status}
              durationSeconds={audioAsset?.duration_seconds ?? null}
            />
          </div>
        )}

        {model.cover_url && (
          <div data-model-cover className="w-full overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]">
            <Image
              src={model.cover_url}
              alt={model.title}
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="block h-auto w-full max-w-full object-contain"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        )}

        <article className="markdown-body prose prose-invert prose-dark max-w-none space-y-6 text-[15px] leading-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={markdownComponents}>
            {model.body ?? model.summary ?? ""}
          </ReactMarkdown>
        </article>
        <TableWidthSync />

        {(model.tags ?? []).length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Tags</h3>
            <div className="flex flex-wrap gap-2 text-[13px]">
              {(model.tags ?? []).map((tag, index) => {
              const label = tagMap.get(tag) ?? tag;
              const query = tag;
              return (
                <Link key={`${tag}-${index}`} href={`/library?tag=${encodeURIComponent(query)}`}>
                  <Badge variant="outline" className={tagPalette[index % tagPalette.length]}>
                    {label}
                  </Badge>
                </Link>
              );
            })}
            </div>
          </section>
        )}

        <section className="border-t border-[#1e3442] pt-6 text-xs text-slate-400">
          <p>References</p>
          <p>Generated at {new Date(model.created_at).toLocaleDateString()}</p>
        </section>
      </main>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-10 rounded-2xl bg-[#0f202d] p-4 text-sm text-slate-200 shadow-card">
          <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{categoryLabel}</div>
          {relatedModels.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">No other models in this category yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {relatedModels.map((item) => (
                <Link
                  key={item.id}
                  href={`/models/${item.slug}`}
                  className="flex gap-3 rounded-xl border border-[#1e3442] bg-[#0d1f2e] p-3 transition hover:border-accent"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#132836]">
                    {item.cover_url ? (
                      <Image src={item.cover_url} alt={item.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900/60" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold leading-snug text-white line-clamp-2">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(item.updated_at ?? new Date()).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
